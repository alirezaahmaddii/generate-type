import * as fs from 'fs';
import * as path from 'path';

const apiFolderPath = path.join(__dirname, './src/api');

const outputFilePath = path.join(apiFolderPath, 'apiInstance.ts');

const apiInstanceContent = `
import { Api } from "./Api";

export const apiInstance = new Api({
    baseURL: "https://dev-app.layer.cafe",
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
    }
});
`;

if (!fs.existsSync(apiFolderPath)){
    fs.mkdirSync(apiFolderPath, { recursive: true });
}

fs.writeFileSync(outputFilePath, apiInstanceContent, 'utf8');

console.log('File apiInstance.ts has been created successfully!');
