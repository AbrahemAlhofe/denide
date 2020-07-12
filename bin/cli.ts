#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const packageConfig: {
    version : string,
    description : string
} = JSON.parse( fs.readFileSync( path.resolve(__dirname, '../package.json') ) )
const { spawn } = require('child_process')
const consola = require('consola');

// init cmd programm
program
  .version(packageConfig.version)
  .description(packageConfig.description)

function createPackageFile(path: string): Promise<any> {
  const npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['init', '-y'], {
    cwd : path
  });
  return new Promise((resolve) => {
    npm.on('close', () => {
      const file = JSON.parse( fs.readFileSync(`${path}/package.json`).toString() )
      file.scripts = {
        dev: "cross-env NODE_ENV=development nodemon server/index.js --watch server",
        prod: "cross-env NODE_ENV=production node server/index.js",
        build: "denide build"
      };
      fs.writeFileSync(`${path}/package.json`, JSON.stringify(file, null, 1), 'utf8')
      resolve()
    })
  })
}

function createDirectoryContents (templatePath: string, newProjectPath: string): void {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file: string) => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, 'utf8');

      const writePath = `${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}


function installDependencies (path: string): Promise<any> {
  const Dependencies = [
    "nodemon",
    "cross-env",
    "express",
    "denide"
  ]

  // Install Dependencies
  const npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install', ...Dependencies], {
    cwd : path
  });

  return new Promise((resolve) => {
    npm.on('close', () => resolve() )
  })
}

function initGit(path: string): Promise<any> {
  const npm = spawn('git', ['init'], {
    cwd : path
  });
  return new Promise((resolve) => {
    npm.on('close', () => resolve())
  })
}

async function createProject (project_name: string) {
  const current_path = path.join(process.cwd(), project_name)
  // create project folder
  consola.info('create project folder')
  fs.mkdirSync( current_path )

  // create package.json file
  consola.info('init package.json file')
  await createPackageFile(current_path)

  // create directory contents
  consola.info('init project template')
  createDirectoryContents( path.resolve(__dirname, '../template') , current_path)

  // install dependencies
  consola.info('install dependencies')
  await installDependencies(current_path)

  // init git
  consola.info('init git')
  await initGit(current_path)

  consola.success({
    message : 'Every thing is Done !',
    badge : true
  })
}

async function buildProject () {

  const config: {
    isProd?: boolean;
    link?: [];
    routes?: { [key: string]: string };
    script?: [];
    sassLoader?: {
      globalFile?: string;
    };
    routerMiddlewares?: [];
    serverMiddleware?: { [key: string]: string };
    port?: number;
  } = require(path.resolve(process.cwd(), "./denide.config")) || {}
  
  config.isProd = true

  const Denide: {
    new (config): {
      bundle (): Promise<any>
    }
  } = require('../denide')

  const denide = new Denide(config)

  consola.info("Start Building . . .");

  await denide.bundle()

  consola.success({
    message : 'Building Succeeded',
    badge : true
  })

}

// command for create new project
program
  .command('create <project_name>')
  .description('create a new project')
  .action(createProject)

// command for create new project
program
  .command('build')
  .description('build a project')
  .action(buildProject)

program.parse(process.argv)
