import fs from "fs";
import postcss from "postcss";
import path from "path";

const { readFile, writeFile } = fs.promises;

function checkDir(filepath) {
    return new Promise((resolve, reject) => {
        const dir = fs.existsSync(path.dirname(filepath));
        dir ? resolve(true) : reject(false);
    });
}

function temporaryDir(filepath) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true });
    }
    return filepath;
}

export default (options = { plugins: [] }) => ({
  name: "postcss",
  setup: function (build) {
    const rootDir = options.rootDir || process.cwd();
    const tmpDirPath = temporaryDir(path.join(rootDir, ".tmp"));

    build.onResolve(
      { filter: /\.css$/, namespace: "file" },
      async (args) => {
        try {
          const resolution = await build.resolve(args.path, {
            resolveDir: args.resolveDir,
            kind: args.kind,
          });

          if (resolution.errors.length > 0) {
            return { errors: resolution.errors };
          }

          const sourceFullPath = resolution.path;
          const sourceBaseName = path.basename(sourceFullPath, path.extname(sourceFullPath));
          const tmpFilePath = path.resolve(tmpDirPath, `${sourceBaseName}.css`);

          await checkDir(tmpFilePath);
          const css = await readFile(sourceFullPath, "utf8");

          const processor = postcss(options.plugins);
          const result = await processor.process(css, {
            from: sourceFullPath,
            to: tmpFilePath,
          });

          await writeFile(tmpFilePath, result.css);

          return {
            path: tmpFilePath,
            watchFiles: [sourceFullPath],
          };
        } catch (error) {
          return { errors: [error] };
        }
      }
    );
  },
});
