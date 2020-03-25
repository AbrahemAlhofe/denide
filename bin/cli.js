#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const package = JSON.parse( fs.readFileSync( path.resolve(__dirname, '../package.json') ) )
const { spawn } = require('child_process')
const consola = require('consola');

// init cmd programm
program
  .version(package.version)
  .description(package.description)

function createPackageFile(path) {
  const npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['init', '-y'], {
    cwd : path
  });
  return new Promise((resolve, reject) => {
    npm.on('close', (data) => {
      const file = JSON.parse( fs.readFileSync(`${path}/package.json`).toString() )
      file.scripts = {
        "dev": "cross-env NODE_ENV=development nodemon server/index.js --watch server"
      }
      fs.writeFileSync(`${path}/package.json`, JSON.stringify(file, 1, 1), 'utf8')
      resolve()
    })
  })
}

function createDirectoryContents (templatePath, newProjectPath) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
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


function installDependencies (path) {
  const Dependencies = [
    "dotenv",
    "express",
    "jsdom",
    "merge-anything",
    "nodemon",
    "prettier",
    "vue",
    "vue-router",
    "vue-server-renderer",
    "vuex",
  ]

  // Install Dependencies
  const npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install', ...Dependencies], {
    cwd : path
  });

  return new Promise((resolve, reject) => {
    npm.on('close', () => resolve() )
  })
}

function installDevDependencies(path) {
  const DevDependencies = [
    // Webpack
    "webpack",
    "html-loader",

    // Eslint
    "eslint",
    "eslint-config-airbnb-base",
    "eslint-config-prettier",
    "eslint-loader",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-node",
    "eslint-plugin-prettier",

    // Vue
    "vue-loader",
    "vue-style-loader",
    "vue-template-compiler",

    // Babel
    "@babel/core",
    "@babel/preset-env",
    "babel-loader",

    // Css
    "sass-loader",
    "css-loader",
    "mini-css-extract-plugin",
    "node-sass",
    "extract-text-webpack-plugin",

    'copy-webpack-plugin'
  ]

  // Install DevDependencies
  const npm = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['install', '-D', ...DevDependencies], {
    cwd : path
  });

  return new Promise((resolve, reject) => {
    npm.on('close', () => resolve() )
  })
}

function initGit(path) {
  const npm = spawn('git', ['init'], {
    cwd : path
  });
  return new Promise((resolve, reject) => {
    npm.on('close', () => resolve())
  })
}

async function createProject (project_name) {
  const current_path = path.join(process.cwd(), project_name)
  // create project folder
  consola.info('create project folder')
  fs.mkdirSync( current_path )

  // create package.json file
  consola.info('init package.json file')
  const packageFile = await createPackageFile(current_path)

  // create directory contents
  consola.info('init project template')
  const directoryContents = createDirectoryContents('../template', current_path)

  // install dependencies
  consola.info('install dependencies')
  const dependencies = await installDependencies(current_path)

  // install dev dependencies
  consola.info('install dev dependencies')
  const devDependencies = await installDevDependencies(current_path)

  // init git
  consola.info('init git')
  const git = await initGit(current_path)

  consola.success({
    message : 'Every thing is Done !',
    badge : true
  })

}

// commandy for create new project
program
  .command('create <project_name>')
  .description('create a new project')
  .action(createProject)

program.parse(process.argv)
