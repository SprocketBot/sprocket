/*
 *   This script escapes queries written for image generation.
 *   It Does all of the following:
 *       Replaces all new line characters with a space
 *       removes all tabs
 *       replaces any sequence of spaces with a single space
 *       removes spaces after '(' and before ')'
 *       escapes any " character to \"
 *
 *   This will leave a minimal query that can go into the json that will be uploaded to the database
 *
 *   Usage: simply run node path/to/queryescaper path/to/query_file_name
 *   when using in wsl, you can run the command with a | clip.exe appended to the end to copy the result to your clipboard
 *
 */
fs = require('fs');
// console.log(process.argv.slice(2))

const filestring = fs.readFileSync(process.argv.slice(2)[0]);
// console.log(filestring);

outstring = filestring
  .toString()
  .replace(/\n/g, ' ')
  .replace(/\t/g, ' ')
  .replace(/  +/g, ' ')
  .replace(/\( /g, '(')
  .replace(/ \)/g, ')')
  .replace(/"/g, '\\"');

// console.log(Buffer.from(outstring));

process.stdout.write(outstring);
