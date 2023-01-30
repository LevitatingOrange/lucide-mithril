import ts from "typescript";
import fs from "fs";
import path from "path";
import * as minifyHtml from "@minify-html/node";

const INDEX_FILE_PROLOG = `
import m, { Vnode, Attributes } from "mithril";

/* @license
License for all svg content (icons):
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

License for the glue code:
MIT License

Copyright (c) 2022 Lennart Vogelsang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

`;

const ICON_FOLDER = "node_modules/lucide-static/icons/";
const ICON_EXTENSION = ".svg";
const INDEX_FILE_PATH = "src/index.ts";

const custom_icon_filter = (file) => true;

const to_pascal_case = (s) => {
  let regex = /[_-]?([a-zA-Z0-9]+)/g;
  let result = "";
  let match = regex.exec(s);
  while (match != null) {
    result += match[1].charAt(0).toUpperCase() + match[1].slice(1);
    match = regex.exec(s);
  }
  return result;
};

const replace_dashes = (s) => s.replace(/-/g, "_");
const replace_underscores = (s) => s.replace(/\_/g, "-");

fs.writeFileSync(INDEX_FILE_PATH, INDEX_FILE_PROLOG);

const index_ts = ts.createSourceFile(
  INDEX_FILE_PATH,
  "",
  ts.ScriptTarget.ESNext,
  false,
  ts.ScriptKind.TS
);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const mithril_id = ts.factory.createIdentifier("m");

let icon_declarations = fs
  .readdirSync(ICON_FOLDER)
  .filter(
    (file) =>
      path.extname(file).toLowerCase() === ICON_EXTENSION &&
      custom_icon_filter(file)
  )
  .map((file) => {
    let text = "";
    const svg_content = fs.readFileSync(ICON_FOLDER + "/" + file);
    const icon_name = replace_dashes(path.basename(file, ICON_EXTENSION));
    const icon_class = replace_underscores(icon_name);

    const icon_lit = ts.factory.createStringLiteral(
      minifyHtml.default
        .minify(svg_content, { keep_spaces_between_attributes: true })
        .toString()
    );

    const svg_def = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(mithril_id, "trust"),
      undefined,
      [icon_lit]
    );

    const icon_def = ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            to_pascal_case(icon_name),
            undefined,
            ts.factory.createTypeReferenceNode("Vnode<Attributes, {}>"),
            ts.factory.createCallExpression(mithril_id, undefined, [
              ts.factory.createStringLiteral(`.lucide-icon.${icon_class}`),
              svg_def,
            ])
          ),
        ],
        ts.NodeFlags.Const
      )
    );

    text = [printer.printNode(ts.EmitHint.Unspecified, icon_def, index_ts), ""];

    return text;
  });

const new_file_content = icon_declarations.flat().join("\n");

fs.appendFileSync(INDEX_FILE_PATH, new_file_content);
