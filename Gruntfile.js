module.exports = function(grunt) {
  var secret = grunt.file.readJSON("config/secret.json");

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        "app/**/*.js",
        "lib/**/*.js",
        "!**/vendor/**/*.js"
      ],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        globals: {
          exports: true,
          module: false,
          window: true,
          app: true,
          jQuery: true,
          FB: true,
          twttr: true,
          ppar: true
        }
      }
    },
    clean: {
      folder: "dist",
      folderTwo: ["build"]
    },
    copy: {
      main: {
        files: [{
          expand: true,
          src: ["app/**", "lib/**", "index.js", "package.json", "!**/data/**",
            "sql/db-setup.sql", "sql/db-setup.d/*.sql",
            "sql/db-setup.d/*.json", "config/*.json", "Deployment.md"],
          dest: "build/yolosparo"
        }, {
          expand: false,
          src: ["bin/deploy_dev.sh"],
          dest: "dist/deploy_dev.sh"
        }]
      }
    },
    compress: {
      main: {
        options: {
          archive: "dist/yolosparo-<%= pkg.version %>.tgz",
          mode: "tgz"
        },
        files: [{
          expand: true,
          src: ["**"], // What should be included in the zip
          dest: ".",
          cwd: "build"
        }]
      }
    },
    release: {
      options: {
        push: false,
        npm: false,
        folder: "build",
        beforeBump: ["jshint"],
        beforeRelease: ["clean", "copy", "compress"],
        github: {
          repo: "piratas-ar/yolosparo",
          usernameVar: "GITHUB_USERNAME",
          passwordVar: "GITHUB_PASSWORD"
        }
      }
    },
    secret: grunt.file.readJSON("config/secret.json"),
    "sftp": {
      deploy: {
        files: {
          "./": ["dist/*"]
        },
        options: {
          host: "<%= secret.host %>",
          path: "<%= secret.remotePath %>",
          username: "<%= secret.username %>",
          privateKey: grunt.file.read(secret.privateKey),
          passphrase: "<%= secret.passphrase %>",
          srcBasePath: "dist/",
          showProgress: true
        }
      }
    },
    "sshexec": {
      "remote-deploy-dev": {
        command: "<%= secret.remotePath %>/deploy_dev.sh <%= pkg.version %>",
        options: {
          host: "<%= secret.host %>",
          username: "<%= secret.username %>",
          privateKey: grunt.file.read(secret.privateKey),
          passphrase: "<%= secret.passphrase %>"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks("grunt-release");
  grunt.loadNpmTasks('grunt-ssh');

  // Default task.
  grunt.registerTask("default", ["jshint", "clean", "copy", "compress"]);
  grunt.registerTask("deploy", ["jshint", "clean", "copy", "compress",
    "sftp", "sshexec"]);
};

