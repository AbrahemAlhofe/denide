#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var program = require('commander');
var fs = require('fs');
var path = require('path');
var packageConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')));
var spawn = require('child_process').spawn;
var consola = require('consola');
// init cmd programm
program
    .version(packageConfig.version)
    .description(packageConfig.description);
function createPackageFile(path) {
    var npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['init', '-y'], {
        cwd: path
    });
    return new Promise(function (resolve) {
        npm.on('close', function () {
            var file = JSON.parse(fs.readFileSync(path + "/package.json").toString());
            file.scripts = {
                "dev": "cross-env NODE_ENV=development nodemon server/index.js --watch server"
            };
            fs.writeFileSync(path + "/package.json", JSON.stringify(file, null, 1), 'utf8');
            resolve();
        });
    });
}
function createDirectoryContents(templatePath, newProjectPath) {
    var filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(function (file) {
        var origFilePath = templatePath + "/" + file;
        // get stats about the current file
        var stats = fs.statSync(origFilePath);
        if (stats.isFile()) {
            var contents = fs.readFileSync(origFilePath, 'utf8');
            var writePath = newProjectPath + "/" + file;
            fs.writeFileSync(writePath, contents, 'utf8');
        }
        else if (stats.isDirectory()) {
            fs.mkdirSync(newProjectPath + "/" + file);
            // recursive call
            createDirectoryContents(templatePath + "/" + file, newProjectPath + "/" + file);
        }
    });
}
function installDependencies(path) {
    var Dependencies = [
        "nodemon",
        "cross-env",
        "express",
        "denide"
    ];
    // Install Dependencies
    var npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', __spreadArrays(['install'], Dependencies), {
        cwd: path
    });
    return new Promise(function (resolve) {
        npm.on('close', function () { return resolve(); });
    });
}
function initGit(path) {
    var npm = spawn('git', ['init'], {
        cwd: path
    });
    return new Promise(function (resolve) {
        npm.on('close', function () { return resolve(); });
    });
}
function createProject(project_name) {
    return __awaiter(this, void 0, void 0, function () {
        var current_path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    current_path = path.join(process.cwd(), project_name);
                    // create project folder
                    consola.info('create project folder');
                    fs.mkdirSync(current_path);
                    // create package.json file
                    consola.info('init package.json file');
                    return [4 /*yield*/, createPackageFile(current_path)
                        // create directory contents
                    ];
                case 1:
                    _a.sent();
                    // create directory contents
                    consola.info('init project template');
                    createDirectoryContents(path.resolve(__dirname, '../template'), current_path);
                    // install dependencies
                    consola.info('install dependencies');
                    return [4 /*yield*/, installDependencies(current_path)
                        // init git
                    ];
                case 2:
                    _a.sent();
                    // init git
                    consola.info('init git');
                    return [4 /*yield*/, initGit(current_path)];
                case 3:
                    _a.sent();
                    consola.success({
                        message: 'Every thing is Done !',
                        badge: true
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function buildProject() {
    return __awaiter(this, void 0, void 0, function () {
        var config, Denide, denide;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = require(path.resolve(process.cwd(), "./denide.config")) || {};
                    config.isProd = true;
                    Denide = require('../denide');
                    denide = new Denide(config);
                    return [4 /*yield*/, denide.bundle()];
                case 1:
                    _a.sent();
                    consola.success({
                        message: 'Building Succeeded',
                        badge: true
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// command for create new project
program
    .command('create <project_name>')
    .description('create a new project')
    .action(createProject);
// command for create new project
program
    .command('build')
    .description('build a project')
    .action(buildProject);
program.parse(process.argv);
