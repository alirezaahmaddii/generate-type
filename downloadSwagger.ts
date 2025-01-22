import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import JsonToTS from 'json-to-ts';

const apiUrl = 'https://dev-zion-api.devastation.ru/schema/';
const outputFilePathSchemaService = 'schemaService.yaml';
const outputFilePathSchemaServiceJson = 'schemaService.json';

interface SchemaProperty {
    type: string;
    properties?: Record<string, any>;
}

interface ApiResponse {
    components: {
        schemas: Record<string, SchemaProperty>;
    };
    paths: Record<string, any>;
}

axios.get<ApiResponse>(apiUrl)
    .then(response => {
        const schemas = response.data.components.schemas;
        const pathsJsonString = JSON.stringify(response.data.paths, null, 2);
        const schemasJsonString = JSON.stringify(response.data.components.schemas, null, 2);

        const schemasYamlString = yaml.dump(response.data.components.schemas, {
            noRefs: true,
            indent: 2
        });

        const processedSchemas: Record<string, any> = {};
        for (const [key, value] of Object.entries(schemas)) {
            if (value.type === 'object' && value.properties) {
                processedSchemas[key] = value;
            }
        }

        const typeInterfaces = JsonToTS(processedSchemas);
        const exportedTypeInterfaces = typeInterfaces.map(typeInterface => `export ${typeInterface}`);
        const allTypesContent = exportedTypeInterfaces.join('\n\n');

        fs.writeFileSync(outputFilePathSchemaService, schemasYamlString);
        fs.writeFileSync(outputFilePathSchemaServiceJson, schemasJsonString);

        console.log(`Schema YAML has been saved to ${outputFilePathSchemaService}`);
        console.log(`Schema JSON has been saved to ${outputFilePathSchemaServiceJson}`);
    })
    .catch(error => {
        console.error(`Error: ${error.message}`);
    });
