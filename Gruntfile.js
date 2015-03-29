module.exports = function(grunt) {

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
          src: ["app/**", "lib/**", "index.js", "!**/data/**"],
          dest: "build/"
        }, {
          expand: true,
          flatten: true,
          src: ["config/*.json"],
          dest: "build/"
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
    "sftp-deploy": {
      build: {
        auth: {
          host: "yolosparo.org",
          authKey: "default"
        },
        src: 'dist',
        dest: '.'
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks("grunt-release");
  grunt.loadNpmTasks('grunt-sftp-deploy');

  // Default task.
  grunt.registerTask("default", ["jshint", "clean", "copy", "compress"]);
};
