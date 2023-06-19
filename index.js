import { createServer } from "http";
import path from "path";
import fs from "fs";
import Converter from "./converter.js";

const server = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/exports") {
      handleExportRequest(req, res);
    } else if (req.method === "GET" && req.url === "/files") {
      handleGetFilesRequest(req, res);
    } else if (req.method === "GET" && req.url.startsWith("/files/")) {
      handleGetFileRequest(req, res);
    } else if (req.method === "DELETE" && req.url.startsWith("/files/")) {
      handleDeleteFileRequest(req, res);
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  });
  
  function handleExportRequest(req, res) {
    let body = "";
  
    req.on("data", (chunk) => {
      body += chunk;
    });
  
    req.on("end", async () => {
      try {
        const requestBody = JSON.parse(body);
        const { directoryPath } = requestBody;
  
        if (!directoryPath) {
          res.statusCode = 400;
          res.end("Directory Path is required");
          return;
        }
  
        const converter = new Converter(directoryPath);
        await converter.start();
  
        res.statusCode = 200;
        res.end("CSV files are converted and saved successfully");
      } catch (error) {
        console.error("Error", error);
        res.statusCode = 500;
        res.end("Server Error");
      }
    });
  }
  
  function handleGetFilesRequest(req, res) {
    try {
      const jsonFiles = fs.readdirSync("converted");
      const fileNames = jsonFiles.map((fileName) =>
        path.parse(fileName).name
      );
  
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(fileNames));
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
      res.end("Server Error");
    }
  }
  
  function handleGetFileRequest(req, res) {
    const fileName = req.url.split("/")[2] + ".json";
    const filePath = path.join("converted", fileName);
  
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf8");
  
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(fileContent);
      } else {
        res.statusCode = 404;
        res.end("File is not found");
      }
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
      res.end("Server Error");
    }
  }
  
  function handleDeleteFileRequest(req, res) {
    const fileName = req.url.split("/")[2] + ".json";
    const filePath = path.join("converted", fileName);
  
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.statusCode = 200;
        res.end("File is deleted");
      } else {
        res.statusCode = 404;
        res.end("File is not found");
      }
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
    res.end("Server Error");
  }
}

server.listen(3000);







