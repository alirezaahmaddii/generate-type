import { compile } from 'json-schema-to-typescript';
import * as fs from 'fs';
import * as path from 'path';

const schemaFilePath = path.resolve(__dirname, 'schemaService.json');
const outputFilePath = path.resolve(__dirname, 'allTypes.ts');

fs.readFile(schemaFilePath, 'utf-8', async (err, data) => {
    if (err) {
        console.error('Error reading JSON schema file:', err);
        return;
    }

    try {
        const schema = JSON.parse(data);
        const allSchemas = schema.components?.schemas || schema;

        let allTypesContent = '';

        for (const [schemaName, schemaContent] of Object.entries(allSchemas)) {
            try {
                const cleanedSchema = JSON.parse(
                    JSON.stringify(schemaContent, (key, value) => {
                        if (key === 'readOnly' || key === 'nullable') {
                            return undefined;
                        }
                        return value;
                    })
                );

                const ts = await compile(cleanedSchema, schemaName, {
                    bannerComment: '',
                });

                allTypesContent += `// Schema: ${schemaName}\n${ts}\n\n`;
            } catch (compileError) {
                console.error(`Error compiling schema "${schemaName}":`, compileError);
            }
        }

        fs.writeFileSync(outputFilePath, allTypesContent);
        console.log(`All TypeScript types have been saved to ${outputFilePath}`);
    } catch (parseError) {
        console.error('Error parsing JSON schema:', parseError);
    }
});
