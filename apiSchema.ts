import * as fs from "fs";
import * as path from "path";

interface Endpoint {
    [key: string]: any;
}

const generateHook = (
    endpointPath: string,
    method: string,
    data: any,
    typeImports: Set<string>
): string => {
    const operationId = data.operationId;
    const parameters = data.parameters || [];
    const requestBody = data.requestBody || null;

    const dynamicParams = endpointPath.match(/{\w+}/g) || [];
    const dynamicParamsStrings = dynamicParams.map((param) =>
        param.replace(/[{}]/g, "")
    );

    const filteredParameters = parameters.filter(
        (param: any) => !dynamicParamsStrings.includes(param.name)
    );

    const allParams = [...dynamicParamsStrings, ...filteredParameters.map((p: any) => p.name)];
    const paramsString = allParams
        .map((param) => {
            const type = dynamicParamsStrings.includes(param)
                ? "string"
                : getType(filteredParameters.find((p: any) => p.name === param)?.schema?.type);
            return `${param}: ${type}`;
        })
        .join(", ");

    const getUniqueSchemas = (content: any): string[] => {
        const schemas = Object.keys(content || {}).map(
            (key) => content[key]?.schema?.$ref?.split("/").pop() || "any"
        );
        return Array.from(new Set(schemas));
    };

    const bodyType = requestBody ? getUniqueSchemas(requestBody.content) : [];
    bodyType.forEach((type) => {
        if (type !== "any") {
            typeImports.add(type);
        }
    });

    const bodyString = bodyType.length ? `data: ${bodyType.join(" | ")}` : "";

    const processedPath = endpointPath.replace(/{\w+}/g, (match) => {
        const param = match.replace(/[{}]/g, "");
        return `\${${param}}`;
    });

    return `
export const use${operationId.replace(/\s/g, "")} = () => {
  return async (${paramsString ? `${paramsString}, ` : ""}${
        bodyString ? `${bodyString}, ` : ""
    }config: any = {}) => {
    try {
      const response = await axiosInstance({
        url: \`${processedPath}\`,
        method: "${method.toUpperCase()}",
        ${
        filteredParameters.length > 0
            ? `params: { ${filteredParameters.map((p: any) => p.name).join(", ")} },`
            : ""
    }
        ${bodyType.length ? `data,` : ""}
        ...config
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in use${operationId.replace(/\s/g, "")}:", error);
      throw error;
    }
  };
};
  `;
};

const getType = (type: string): string => {
    if (type === "integer") return "number";
    return type || "any";
};

const generateHooks = (endpoints: Endpoint): string => {
    let hooks = `import axiosInstance from './axiosInstance';\n`;
    const typeImports: Set<string> = new Set();

    for (const [path, methods] of Object.entries(endpoints)) {
        for (const [method, data] of Object.entries(methods as any)) {
            hooks += generateHook(path, method, data, typeImports);
        }
    }

    if (typeImports.size > 0) {
        hooks = `import { ${Array.from(typeImports).join(", ")} } from './allTypes.ts';\n` + hooks;
    }

    return hooks;
};

const yamlData = fs.readFileSync(path.resolve(__dirname, "schemaService.yaml"), "utf-8");
const endpoints: Endpoint = JSON.parse(yamlData);

const hooks = generateHooks(endpoints);
fs.writeFileSync(path.resolve(__dirname, "hooks.ts"), hooks, "utf-8");
console.log("Hooks generated successfully!");
