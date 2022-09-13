module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: ["tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint",
    "simple-import-sort"
  ],
  ignorePatterns: ["*.cjs", ".eslintrc.js", "jest.config.js", "ormconfig.js", "scripts/*", "*.json"],
  rules: {
    // Configure import sorting since eslint sort-imports doesn't autofix
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",


    /**
     * ESLint Rules
     * https://eslint.org/docs/rules/
     * Config is defined for each rule, regardless of if its in the recommended set or not
     * (r) means that rule is in the eslint:recommended rule set
     * (f) means that rule is automatically fixable using the `--fix` command line argument
     */
    // Possible Errors
    // These rules relate to possible syntax or logic errors in JavaScript code:
    "for-direction": "error",                                                  /* (r ) enforce "for" loop update clause moving the counter in the right direction. */
    "getter-return": "error",                                                  /* (r ) enforce `return` statements in getters */
    "no-async-promise-executor": "error",                                      /* (r ) disallow using an async function as a Promise executor */
    "no-await-in-loop": "off",                                                 /* (  ) disallow `await` inside of loops */
    "no-compare-neg-zero": "error",                                            /* (r ) disallow comparing against -0 */
    "no-cond-assign": "error",                                                 /* (r ) disallow assignment operators in conditional expressions */
    "no-console": "error",                                                     /* (r ) disallow the use of `console` */
    "no-constant-condition": "error",                                          /* (r ) disallow constant expressions in conditions */
    "no-control-regex": "error",                                               /* (r ) disallow control characters in regular expressions */
    "no-debugger": "error",                                                    /* (r ) disallow the use of `debugger` */
    "no-dupe-args": "error",                                                   /* (r ) disallow duplicate arguments in `function` definitions */
    "no-dupe-else-if": "error",                                                /* (r ) disallow duplicate conditions in if-else-if chains */
    "no-dupe-keys": "error",                                                   /* (r ) disallow duplicate keys in object literals */
    "no-duplicate-case": "error",                                              /* (r ) disallow duplicate case labels */
    "no-empty": "error",                                                       /* (r ) disallow empty block statements */
    "no-empty-character-class": "error",                                       /* (r ) disallow empty character classes in regular expressions */
    "no-ex-assign": "error",                                                   /* (r ) disallow reassigning exceptions in `catch` clauses */
    "no-extra-boolean-cast": "error",                                          /* (rf) disallow unnecessary boolean casts */
    "no-extra-parens": "off",                                                  /* ( f) disallow unnecessary parentheses */ // Disabled in favor of typescript-eslint rule below
    "no-extra-semi": "off",                                                    /* (rf) disallow unnecessary semicolons */ // Disabled in favor of typescript-eslint rule below
    "no-func-assign": "error",                                                 /* (r ) disallow reassigning `function` declarations */
    "no-import-assign": "error",                                               /* (r ) disallow assigning to imported bindings */
    "no-inner-declarations": "error",                                          /* (r ) disallow variable or `function` declarations in nested blocks */
    "no-invalid-regexp": "error",                                              /* (r ) disallow invalid regular expression strings in `RegExp` constructors */
    "no-irregular-whitespace": "error",                                        /* (r ) disallow irregular whitespace */
    "no-loss-of-precision": "off",                                             /* (  ) disallow literal numbers that lose precision */ // Disabled in favor of typescript-eslint rule below
    "no-misleading-character-class": "error",                                  /* (r ) disallow characters which are made with multiple code points in character class syntax */
    "no-obj-calls": "error",                                                   /* (r ) disallow calling global object properties as functions */
    "no-promise-executor-return": "error",                                     /* (  ) disallow returning values from Promise executor functions */
    "no-prototype-builtins": "error",                                          /* (r ) disallow calling some `Object.prototype` methods directly on objects */
    "no-regex-spaces": "error",                                                /* (r ) disallow multiple spaces in regular expressions */
    "no-setter-return": "error",                                               /* (r ) disallow returning values from setters */
    "no-sparse-arrays": "error",                                               /* (r ) disallow sparse arrays */
    "no-template-curly-in-string": "error",                                    /* (  ) disallow template literal placeholder syntax in regular strings */
    "no-unexpected-multiline": "error",                                        /* (r ) disallow confusing multiline expressions */
    "no-unreachable": "error",                                                 /* (r ) disallow unreachable code after `return`, `throw`, `continue`, and `break` statements */
    "no-unreachable-loop": "error",                                            /* (  ) disallow loops with a body that allows only one iteration */
    "no-unsafe-finally": "error",                                              /* (r ) disallow control flow statements in `finally` blocks */
    "no-unsafe-negation": "error",                                             /* (r ) disallow negating the left operand of relational operators */
    "no-unsafe-optional-chaining": "error",                                    /* (  ) disallow use of optional chaining in contexts where the `undefined` value is not allowed */
    "no-useless-backreference": "off",                                         /* (  ) disallow useless backreferences in regular expressions */
    "require-atomic-updates": "error",                                         /* (  ) disallow assignments that can lead to race conditions due to usage of `await` or `yield` */
    "use-isnan": "error",                                                      /* (r ) require calls to `isNaN()` when checking for `NaN` */
    "valid-typeof": "error",                                                   /* (r ) enforce comparing `typeof` expressions against valid strings */

    // Best Practices
    // These rules relate to better ways of doing things to help you avoid problems:
    "accessor-pairs": "off",                                                   /* (  ) enforce getter and setter pairs in objects and classes */
    "array-callback-return": "error",                                          /* (  ) enforce `return` statements in callbacks of array methods */
    "block-scoped-var": "error",                                               /* (  ) enforce the use of variables within the scope they are defined */
    "class-methods-use-this": "off",                                           /* (  ) enforce that class methods utilize `this` */
    "complexity": "off",                                                       /* (  ) enforce a maximum cyclomatic complexity allowed in a program */
    "consistent-return": "error",                                              /* (  ) require `return` statements to either always or never specify values */
    "curly": "off",                                                            /* ( f) enforce consistent brace style for all control statements */
    "default-case": "error",                                                   /* (  ) require `default` cases in `switch` statements */
    "default-case-last": "error",                                              /* (  ) enforce default clauses in switch statements to be last */
    "default-param-last": "off",                                               /* (  ) enforce default parameters to be last */ // Disabled in favor of typescript-eslint rule below
    "dot-location": ["error", "property"],                                     /* ( f) enforce consistent newlines before and after dots */
    "dot-notation": "off",                                                     /* ( f) enforce dot notation whenever possible */ // Disabled in favor of typescript-eslint rule below
    "eqeqeq": "error",                                                         /* ( f) require the use of `===` and `!==` */
    "grouped-accessor-pairs": "error",                                         /* (  ) require grouped accessor pairs in object literals and classes */
    "guard-for-in": "error",                                                   /* (  ) require `for-in` loops to include an `if` statement */
    "max-classes-per-file": "off",                                             /* (  ) enforce a maximum number of classes per file */
    "no-alert": "error",                                                       /* (  ) disallow the use of `alert`, `confirm`, and `prompt` */
    "no-caller": "error",                                                      /* (  ) disallow the use of `arguments.caller` or `arguments.callee` */
    "no-case-declarations": "error",                                           /* (r ) disallow lexical declarations in case clauses */
    "no-constructor-return": "error",                                          /* (  ) disallow returning value from constructor */
    "no-div-regex": "off",                                                     /* ( f) disallow division operators explicitly at the beginning of regular expressions */
    "no-else-return": "error",                                                 /* ( f) disallow `else` blocks after `return` statements in `if` statements */
    "no-empty-function": "off",                                                /* (  ) disallow empty functions */
    "no-empty-pattern": "error",                                               /* (r ) disallow empty destructuring patterns */
    "no-eq-null": "error",                                                     /* (  ) disallow `null` comparisons without type-checking operators */
    "no-eval": "error",                                                        /* (  ) disallow the use of `eval()` */
    "no-extend-native": "error",                                               /* (  ) disallow extending native types */
    "no-extra-bind": "error",                                                  /* ( f) disallow unnecessary calls to `.bind()` */
    "no-extra-label": "error",                                                 /* ( f) disallow unnecessary labels */
    "no-fallthrough": "error",                                                 /* (r ) disallow fallthrough of `case` statements */
    "no-floating-decimal": "error",                                            /* ( f) disallow leading or trailing decimal points in numeric literals */
    "no-global-assign": "error",                                               /* (r ) disallow assignments to native objects or read-only global variables */
    "no-implicit-coercion": "error",                                           /* ( f) disallow shorthand type conversions */
    "no-implicit-globals": "error",                                            /* (  ) disallow declarations in the global scope */
    "no-implied-eval": "off",                                                  /* (  ) disallow the use of `eval()`-like methods */ // Disabled in favor of typescript-eslint rule below
    "no-invalid-this": "off",                                                  /* (  ) disallow `this` keywords outside of classes or class-like objects */ // Disabled in favor of typescript-eslint rule below
    "no-iterator": "error",                                                    /* (  ) disallow the use of the `__iterator__` property */
    "no-labels": "error",                                                      /* (  ) disallow labeled statements */
    "no-lone-blocks": "error",                                                 /* (  ) disallow unnecessary nested blocks */
    "no-loop-func": "off",                                                     /* (  ) disallow function declarations that contain unsafe references inside loop statements */ // Disabled in favor of typescript-eslint rule below
    "no-magic-numbers": "off",                                                 /* (  ) disallow magic numbers */ // Disabled in favor of typescript-eslint rule below
    "no-multi-spaces": "off",                                                  /* ( f) disallow multiple spaces */
    "no-multi-str": "error",                                                   /* (  ) disallow multiline strings */
    "no-new": "error",                                                         /* (  ) disallow `new` operators outside of assignments or comparisons */
    "no-new-func": "error",                                                    /* (  ) disallow `new` operators with the `Function` object */
    "no-new-wrappers": "error",                                                /* (  ) disallow `new` operators with the `String`, `Number`, and `Boolean` objects */
    "no-nonoctal-decimal-escape": "error",                                     /* (  ) disallow `\8` and `\9` escape sequences in string literals */
    "no-octal": "error",                                                       /* (r ) disallow octal literals */
    "no-octal-escape": "error",                                                /* (  ) disallow octal escape sequences in string literals */
    "no-param-reassign": "error",                                              /* (  ) disallow reassigning `function` parameters */
    "no-proto": "error",                                                       /* (  ) disallow the use of the `__proto__` property */
    "no-redeclare": "off",                                                     /* (r ) disallow variable redeclaration */ // Disabled in favor of typescript-eslint rule below
    "no-restricted-properties": "off",                                         /* (  ) disallow certain properties on certain objects */
    "no-return-assign": "error",                                               /* (  ) disallow assignment operators in `return` statements */
    "no-return-await": "off",                                                  /* (  ) disallow unnecessary `return await` */ // Disabled in favor of typescript-eslint rule below
    "no-script-url": "error",                                                  /* (  ) disallow `javascript:` urls */
    "no-self-assign": "error",                                                 /* (r ) disallow assignments where both sides are exactly the same */
    "no-self-compare": "error",                                                /* (  ) disallow comparisons where both sides are exactly the same */
    "no-sequences": "error",                                                   /* (  ) disallow comma operators */
    "no-throw-literal": "off",                                                 /* (  ) disallow throwing literals as exceptions */ // Disabled in favor of typescript-eslint rule below
    "no-unmodified-loop-condition": "error",                                   /* (  ) disallow unmodified loop conditions */
    "no-unused-expressions": "off",                                            /* (  ) disallow unused expressions */
    "no-unused-labels": "error",                                               /* (rf) disallow unused labels */
    "no-useless-call": "error",                                                /* (  ) disallow unnecessary calls to `.call()` and `.apply()` */
    "no-useless-catch": "error",                                               /* (r ) disallow unnecessary `catch` clauses */
    "no-useless-concat": "error",                                              /* (  ) disallow unnecessary concatenation of literals or template literals */
    "no-useless-escape": "error",                                              /* (r ) disallow unnecessary escape characters */
    "no-useless-return": "off",                                                /* ( f) disallow redundant return statements */
    "no-void": "error",                                                        /* (  ) disallow `void` operators */
    "no-warning-comments": "warn",                                             /* (  ) disallow specified warning terms in comments */
    "no-with": "error",                                                        /* (r ) disallow `with` statements */
    "prefer-named-capture-group": "off",                                       /* (  ) enforce using named capture group in regular expression */
    "prefer-promise-reject-errors": "error",                                   /* (  ) require using Error objects as Promise rejection reasons */
    "prefer-regex-literals": "error",                                          /* (  ) disallow use of the `RegExp` constructor in favor of regular expression literals */
    "radix": ["error", "as-needed"],                                           /* (  ) enforce the consistent use of the radix argument when using `parseInt()` */
    "require-await": "off",                                                    /* (  ) disallow async functions which have no `await` expression */ // Disabled in favor of typescript-eslint rule below
    "require-unicode-regexp": "off",                                           /* (  ) enforce the use of `u` flag on RegExp */
    "vars-on-top": "error",                                                    /* (  ) require `var` declarations be placed at the top of their containing scope */
    "wrap-iife": ["error", "inside"],                                          /* ( f) require parentheses around immediate `function` invocations */
    "yoda": ["error", "never", {                                               /* ( f) require or disallow "Yoda" conditions */
      "exceptRange": true
    }],

    // Strict Mode
    // These rules relate to strict mode directives:
    "strict": "off",                                                           /* ( f) require or disallow strict mode directives */

    // Variables
    // These rules relate to variable declarations:
    "init-declarations": "off",                                                /* (  ) require or disallow initialization in variable declarations */
    "no-delete-var": "error",                                                  /* (r ) disallow deleting variables */
    "no-label-var": "error",                                                   /* (  ) disallow labels that share a name with a variable */
    "no-restricted-globals": "off",                                            /* (  ) disallow specified global variables */
    "no-shadow": "off",                                                        /* (  ) disallow variable declarations from shadowing variables declared in the outer scope */ // Disabled in favor of typescript-eslint rule below
    "no-shadow-restricted-names": "error",                                     /* (r ) disallow identifiers from shadowing restricted names */
    "no-undef": "error",                                                       /* (r ) disallow the use of undeclared variables unless mentioned in `global` comments */
    "no-undef-init": "error",                                                  /* ( f) disallow initializing variables to `undefined` */
    "no-undefined": "off",                                                     /* (  ) disallow the use of `undefined` as an identifier */
    "no-unused-vars": "off",                                                   /* (r ) disallow unused variables */ // Disabled in favor of typescript-eslint rule below
    "no-use-before-define": "off",                                             /* (  ) disallow the use of variables before they are defined */ // Disabled in favor of typescript-eslint rule below

    // Stylistic Issues
    // These rules relate to style guidelines, and are therefore quite subjective:
    "array-bracket-newline": ["error", "consistent"],                          /* ( f) enforce linebreaks after opening and before closing array brackets */
    "array-bracket-spacing": ["error", "never", {                              /* ( f) enforce consistent spacing inside array brackets */
      "objectsInArrays": true,
      "arraysInArrays": true
    }],
    "array-element-newline": ["error", "consistent"],                          /* ( f) enforce line breaks after each array element */
    "block-spacing": ["error", "always"],                                      /* ( f) disallow or enforce spaces inside of blocks after opening block and before closing block */
    "brace-style": "off",                                                      /* ( f) enforce consistent brace style for blocks */ // Disabled in favor of typescript-eslint rule below
    "camelcase": "off",                                                        /* (  ) enforce camelcase naming convention */
    "capitalized-comments": "off",                                             /* ( f) enforce or disallow capitalization of the first letter of a comment */
    "comma-dangle": "off",                                                     /* ( f) require or disallow trailing commas */ // Disabled in favor of typescript-eslint rule below
    "comma-spacing": "off",                                                    /* ( f) enforce consistent spacing before and after commas */ // Disabled in favor of typescript-eslint rule below
    "comma-style": "error",                                                    /* ( f) enforce consistent comma style */
    "computed-property-spacing": ["error", "never"],                           /* ( f) enforce consistent spacing inside computed property brackets */
    "consistent-this": "off",                                                  /* (  ) enforce consistent naming when capturing the current execution context */
    "eol-last": "error",                                                       /* ( f) require or disallow newline at the end of files */
    "func-call-spacing": "off",                                                /* ( f) require or disallow spacing between function identifiers and their invocations */  // Disabled in favor of typescript-eslint rule below
    "func-name-matching": ["error", "always"],                                 /* (  ) require function names to match the name of the variable or property to which they are assigned */
    "func-names": "off",                                                       /* (  ) require or disallow named `function` expressions */
    "func-style": ["error", "declaration", {                                   /* (  ) enforce the consistent use of either `function` declarations or expressions */
      "allowArrowFunctions": true
    }],
    "function-call-argument-newline": ["error", "consistent"],                 /* ( f) enforce line breaks between arguments of a function call */
    "function-paren-newline": ["error", "multiline"],                          /* ( f) enforce consistent line breaks inside function parentheses */
    "id-denylist": "off",                                                      /* (  ) disallow specified identifiers */
    "id-length": "off",                                                        /* (  ) enforce minimum and maximum identifier lengths */
    "id-match": "off",                                                         /* (  ) require identifiers to match a specified regular expression */
    "implicit-arrow-linebreak": ["error", "beside"],                           /* ( f) enforce the location of arrow function bodies */
    "indent": "off",                                                           /* ( f) enforce consistent indentation */ // Disabled in favor of typescript-eslint rule below
    "jsx-quotes": "error",                                                     /* ( f) enforce the consistent use of either double or single quotes in JSX attributes */
    "key-spacing": ["error", {                                                 /* ( f) enforce consistent spacing between keys and values in object literal properties */
      "beforeColon": false,
      "afterColon": true,
      "mode": "minimum",
    }],
    "keyword-spacing": "off",                                                  /* ( f) enforce consistent spacing before and after keywords */ // Disabled in favor of typescript-eslint rule below
    "line-comment-position": "off",                                            /* (  ) enforce position of line comments */
    "linebreak-style": ["error", "unix"],                                      /* ( f) enforce consistent linebreak style */
    "lines-around-comment": "off",                                             /* ( f) require empty lines around comments */
    "lines-between-class-members": "off",                                      /* ( f) require or disallow an empty line between class members */ // Disabled in favor of typescript-eslint rule below
    "max-depth": "off",                                                        /* (  ) enforce a maximum depth that blocks can be nested */
    "max-len": "off",                                                          /* (  ) enforce a maximum line length */
    "max-lines": "off",                                                        /* (  ) enforce a maximum number of lines per file */
    "max-lines-per-function": "off",                                           /* (  ) enforce a maximum number of lines of code in a function */
    "max-nested-callbacks": "off",                                             /* (  ) enforce a maximum depth that callbacks can be nested */
    "max-params": "off",                                                       /* (  ) enforce a maximum number of parameters in function definitions */
    "max-statements": "off",                                                   /* (  ) enforce a maximum number of statements allowed in function blocks */
    "max-statements-per-line": "off",                                          /* (  ) enforce a maximum number of statements allowed per line */
    "multiline-comment-style": "off",                                          /* ( f) enforce a particular style for multiline comments */
    "multiline-ternary": ["error", "always-multiline"],                        /* ( f) enforce newlines between operands of ternary expressions */
    "new-cap": "off",                                                          /* (  ) require constructor names to begin with a capital letter */ // Turned off because this gets mad on decorators
    "new-parens": ["error", "always"],                                         /* ( f) enforce or disallow parentheses when invoking a constructor with no arguments */
    "newline-per-chained-call": ["error", {                                    /* ( f) require a newline after each call in a method chain */
      "ignoreChainWithDepth": 2
    }],
    "no-array-constructor": "off",                                             /* (  ) disallow `Array` constructors */
    "no-bitwise": "off",                                                       /* (  ) disallow bitwise operators */
    "no-continue": "off",                                                      /* (  ) disallow `continue` statements */
    "no-inline-comments": "off",                                               /* (  ) disallow inline comments after code */
    "no-lonely-if": "error",                                                   /* ( f) disallow `if` statements as the only statement in `else` blocks */
    "no-mixed-operators": "error",                                             /* (  ) disallow mixed binary operators */
    "no-mixed-spaces-and-tabs": "error",                                       /* (r ) disallow mixed spaces and tabs for indentation */
    "no-multi-assign": "error",                                                /* (  ) disallow use of chained assignment expressions */
    "no-multiple-empty-lines": ["error", {                                     /* ( f) disallow multiple empty lines */
      "max": 1,
      "maxBOF": 0,
      "maxEOF": 1
    }],
    "no-negated-condition": "off",                                             /* (  ) disallow negated conditions */
    "no-nested-ternary": "off",                                                /* (  ) disallow nested ternary expressions */
    "no-new-object": "error",                                                  /* (  ) disallow `Object` constructors */
    "no-plusplus": "off",                                                      /* (  ) disallow the unary operators `++` and `--` */
    "no-restricted-syntax": "off",                                             /* (  ) disallow specified syntax */
    "no-tabs": "error",                                                        /* (  ) disallow all tabs */
    "no-ternary": "off",                                                       /* (  ) disallow ternary operators */
    "no-trailing-spaces": ["error", {                                          /* ( f) disallow trailing whitespace at the end of lines */
      "skipBlankLines": true
    }],
    "no-underscore-dangle": "off",                                             /* (  ) disallow dangling underscores in identifiers */
    "no-unneeded-ternary": "error",                                            /* ( f) disallow ternary operators when simpler alternatives exist */
    "no-whitespace-before-property": "error",                                  /* ( f) disallow whitespace before properties */
    "nonblock-statement-body-position": ["error", "beside"],                   /* ( f) enforce the location of single-line statements */
    "object-curly-newline": ["error", {                                        /* ( f) enforce consistent line breaks after opening and before closing braces */
      "multiline": true,
      "minProperties": 3,
      "consistent": true
    }],
    "object-curly-spacing": "off",                                             /* ( f) enforce consistent spacing inside braces */ // Disabled in favor of typescript-eslint rule below
    "object-property-newline": ["error", {                                     /* ( f) enforce placing object properties on separate lines */
      "allowMultiplePropertiesPerLine": true
    }],
    "one-var": "off",                                                          /* ( f) enforce variables to be declared either together or separately in functions */
    "one-var-declaration-per-line": ["error", "always"],                       /* ( f) require or disallow newlines around variable declarations */
    "operator-assignment": "off",                                              /* ( f) require or disallow assignment operator shorthand where possible */
    "operator-linebreak": ["error", "before"],                                 /* ( f) enforce consistent linebreak style for operators */
    "padded-blocks": "off",                                                    /* ( f) require or disallow padding within blocks */
    "padding-line-between-statements": "off",                                  /* ( f) require or disallow padding lines between statements */
    "prefer-exponentiation-operator": "off",                                   /* ( f) disallow the use of `Math.pow` in favor of the `**` operator */
    "prefer-object-spread": "off",                                             /* ( f) disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead. */
    "quote-props": ["error", "consistent"],                                    /* ( f) require quotes around object literal property names */
    "quotes": "off",                                                           /* ( f) enforce the consistent use of either backticks, double, or single quotes */ // Disabled in favor of typescript-eslint rule below
    "semi": "off",                                                             /* ( f) require or disallow semicolons instead of ASI */ // Disabled in favor of typescript-eslint rule below
    "semi-spacing": ["error", {                                                /* ( f) enforce consistent spacing before and after semicolons */
      "before": false,
      "after": false
    }],
    "semi-style": ["error", "last"],                                           /* ( f) enforce location of semicolons */
    "sort-keys": "off",                                                        /* (  ) require object keys to be sorted */
    "sort-vars": ["error", {                                                   /* ( f) require variables within the same declaration block to be sorted */
      "ignoreCase": true
    }],
    "space-before-blocks": ["error", "always"],                                /* ( f) enforce consistent spacing before blocks */
    "space-before-function-paren": "off",                                      /* ( f) enforce consistent spacing before `function` definition opening parenthesis */ // Disabled in favor of typescript-eslint rule below
    "space-in-parens": ["error", "never"],                                     /* ( f) enforce consistent spacing inside parentheses */
    "space-infix-ops": "off",                                                  /* ( f) require spacing around infix operators */ // Disabled in favor of typescript-eslint rule below
    "space-unary-ops": ["error", {                                             /* ( f) enforce consistent spacing before or after unary operators */
      "words": true,
      "nonwords": false
    }],
    "spaced-comment": ["error", "always", {                                    /* ( f) enforce consistent spacing after the `//` or `/*` in a comment */
      "block": {
        "balanced": true
      }
    }],
    "switch-colon-spacing": ["error", {                                        /* ( f) enforce spacing around colons of switch statements */
      "before": false,
      "after": true
    }],
    "template-tag-spacing": ["error", "never"],                                /* ( f) require or disallow spacing between template tags and their literals */
    "unicode-bom": ["error", "never"],                                         /* ( f) require or disallow Unicode byte order mark (BOM) */
    "wrap-regex": "error", // "Wrap it before you match it"                    /* ( f) require parenthesis around regex literals */

    // ECMAScript 6
    // These rules relate to ES6, also known as ES2015:
    "arrow-body-style": ["error", "as-needed"],                                /* ( f) require braces around arrow function bodies */
    "arrow-parens": ["error", "as-needed"],                                    /* ( f) require parentheses around arrow function arguments */
    "arrow-spacing": ["error", {                                               /* ( f) enforce consistent spacing before and after the arrow in arrow functions */
      "before": true,
      "after": true
    }],
    "constructor-super": "error",                                              /* (r ) require `super()` calls in constructors */
    "generator-star-spacing": ["error", {                                      /* ( f) enforce consistent spacing around `*` operators in generator functions */
      "before": false,
      "after": true
    }],
    "no-class-assign": "error",                                                /* (r ) disallow reassigning class members */
    "no-confusing-arrow": ["error", {                                          /* ( f) disallow arrow functions where they could be confused with comparisons */
      "allowParens": true
    }],
    "no-const-assign": "error",                                                /* (r ) disallow reassigning `const` variables */
    "no-dupe-class-members": "off",                                            /* (r ) disallow duplicate class members */ // Disabled in favor of typescript-eslint rule below
    "no-duplicate-imports": "off",                                             /* (  ) disallow duplicate module imports */ // Disabled in favor of typescript-eslint rule below
    "no-new-symbol": "error",                                                  /* (r ) disallow `new` operators with the `Symbol` object */
    "no-restricted-exports": "off",                                            /* (  ) disallow specified names in exports */
    "no-restricted-imports": ["error", { "patterns": ["src/*"], }],            /* (  ) disallow specified modules when loaded by `import` */
    "no-this-before-super": "error",                                           /* (r ) disallow `this`/`super` before calling `super()` in constructors */
    "no-useless-computed-key": "error",                                        /* ( f) disallow unnecessary computed property keys in objects and classes */
    "no-useless-constructor": "off",                                           /* (  ) disallow unnecessary constructors */ // Disabled in favor of typescript-eslint rule below
    "no-useless-rename": "error",                                              /* ( f) disallow renaming import, export, and destructured assignments to the same name */
    "no-var": "error",                                                         /* ( f) require `let` or `const` instead of `var` */
    "object-shorthand": ["error", "consistent"],                               /* ( f) require or disallow method and property shorthand syntax for object literals */
    "prefer-arrow-callback": "error",                                          /* ( f) require using arrow functions for callbacks */
    "prefer-const": "error",                                                   /* ( f) require `const` declarations for variables that are never reassigned after declared */
    "prefer-destructuring": "off",                                             /* ( f) require destructuring from arrays and/or objects */
    "prefer-numeric-literals": "error",                                        /* ( f) disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals */
    "prefer-rest-params": "error",                                             /* (  ) require rest parameters instead of `arguments` */
    "prefer-spread": "off",                                                    /* (  ) require spread operators instead of `.apply()` */
    "prefer-template": "error",                                                /* ( f) require template literals instead of string concatenation */
    "require-yield": "error",                                                  /* (r ) require generator functions to contain `yield` */
    "rest-spread-spacing": ["error", "never"],                                 /* ( f) enforce spacing between rest and spread operators and their expressions */
    "sort-imports": "off",                                                     /* ( f) enforce sorted import declarations within modules */ // Disabled in favor of `simple-import-sort`
    "symbol-description": "error",                                             /* (  ) require symbol descriptions */
    "template-curly-spacing": ["error", "never"],                              /* ( f) require or disallow spacing around embedded expressions of template strings */
    "yield-star-spacing": ["error", {                                          /* ( f) require or disallow spacing around the `*` in `yield*` expressions */
      "before": false,
      "after": true
    }],


    /**
     * typescript-eslint Rules
     * https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
     * Config is defined for each rule, regardless of if its in the recommended set or not
     * (r) means that rule is in the eslint:recommended rule set
     * (f) means that rule is automatically fixable using the `--fix` command line argument
     * (t) means that rule requires type information to run (https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md)
     */
    // Supported Rules
    "@typescript-eslint/adjacent-overload-signatures": "error",                /* (r  ) Require that member overloads be consecutive */
    "@typescript-eslint/array-type": ["error", {                               /* (  f) Requires using either T[] or Array<T> for arrays */
      "default": "array-simple"
    }],
    "@typescript-eslint/await-thenable": "error",                              /* (r t) Disallows awaiting a value that is not a Thenable */
    "@typescript-eslint/ban-ts-comment": ["error", {                           /* (r  ) Bans @ts-<directive> comments from being used or requires descriptions after directive */
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": "allow-with-description",
      "ts-check": "allow-with-description",
      "minimumDescriptionLength": 10,
    }],
    "@typescript-eslint/ban-tslint-comment": "error",                          /* ( f ) Bans // tslint:<rule-flag> comments from being used */
    "@typescript-eslint/ban-types": "off",                                     /* (rf ) Bans specific types from being used */
    "@typescript-eslint/class-literal-property-style": "off",                  /* ( f ) Ensures that literals on classes are exposed in a consistent style */
    "@typescript-eslint/consistent-indexed-object-style": ["error", "record"], /* ( f ) Enforce or disallow the use of the record type */
    "@typescript-eslint/consistent-type-assertions": ["error", {               /* (  ) Enforces consistent usage of type assertions */
      "assertionStyle": "as"
    }],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],  /* ( f ) Consistent with type definition either interface or type */
    "@typescript-eslint/consistent-type-imports": ["error", {                  /* ( f ) Enforces consistent usage of type imports */
      "prefer": "type-imports"
    }],
    "@typescript-eslint/explicit-function-return-type": "error",               /* (  ) Require explicit return types on functions and class methods */
    "@typescript-eslint/explicit-member-accessibility": ["error", {            /* ( f ) Require explicit accessibility modifiers on class properties and methods */
      "accessibility": "no-public"
    }],
    "@typescript-eslint/explicit-module-boundary-types": "error",              /* (r  ) Require explicit return and argument types on exported functions' and classes' public class methods */
    "@typescript-eslint/member-delimiter-style": ["error", {                   /* ( f ) Require a specific member delimiter style for interfaces and type literals */
      "multiline": {
        "delimiter": "semi",
        "requireLast": true
      },
      "singleline": {
        "delimiter": "semi",
        "requireLast": true
      }
    }],
    "@typescript-eslint/member-ordering": "error",                             /* (   ) Require a consistent member declaration order */
    "@typescript-eslint/method-signature-style": "off",                        /* ( f ) Enforces using a particular method signature syntax. */
    "@typescript-eslint/naming-convention": "off",                             /* (  t) Enforces naming conventions for everything across a codebase */
    "@typescript-eslint/no-base-to-string": "error",                           /* (  t) Requires that .toString() is only called on objects which provide useful information when stringified */
    "@typescript-eslint/no-confusing-non-null-assertion": "error",             /* ( f ) Disallow non-null assertion in locations that may be confusing */
    "@typescript-eslint/no-confusing-void-expression": "error",                /* ( ft) Requires expressions of type void to appear in statement position */
    "@typescript-eslint/no-dynamic-delete": "error",                           /* ( f ) Disallow the delete operator with computed key expressions */
    "@typescript-eslint/no-empty-interface": "error",                          /* (rf ) Disallow the declaration of empty interfaces */
    "@typescript-eslint/no-explicit-any": "error",                             /* (rf ) Disallow usage of the any type */
    "@typescript-eslint/no-extra-non-null-assertion": "error",                 /* (rf ) Disallow extra non-null assertion */
    "@typescript-eslint/no-extraneous-class": ["error", {                      /* (   ) Forbids the use of classes as namespaces */
      "allowEmpty": true
    }],
    "@typescript-eslint/no-floating-promises": "error",                        /* (r t) Requires Promise-like values to be handled appropriately */
    "@typescript-eslint/no-for-in-array": "error",                             /* (r t) Disallow iterating over an array with a for-in loop */
    "@typescript-eslint/no-implicit-any-catch": "off",                         /* ( f ) Disallow usage of the implicit any type in catch clauses */
    "@typescript-eslint/no-inferrable-types": "off",                           /* (rf ) Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean */
    "@typescript-eslint/no-invalid-void-type": "error",                        /* (   ) Disallows usage of void type outside of generic or return types */
    "@typescript-eslint/no-misused-new": "error",                              /* (r  ) Enforce valid definition of new and constructor */
    "@typescript-eslint/no-misused-promises": "error",                         /* (r t) Avoid using promises in places not designed to handle them */
    "@typescript-eslint/no-namespace": "error",                                /* (r  ) Disallow the use of custom TypeScript modules and namespaces */
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",         /* (r  ) Disallows using a non-null assertion after an optional chain expression */
    "@typescript-eslint/no-non-null-assertion": "off",                         /* (r  ) Disallows non-null assertions using the ! postfix operator */
    "@typescript-eslint/no-parameter-properties": "off",                       /* (   ) Disallow the use of parameter properties in class constructors */
    "@typescript-eslint/no-require-imports": "error",                          /* (   ) Disallows invocation of require() */
    "@typescript-eslint/no-this-alias": "error",                               /* (r  ) Disallow aliasing this */
    "@typescript-eslint/no-type-alias": "off",                                 /* (   ) Disallow the use of type aliases */
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",      /* ( ft) Flags unnecessary equality comparisons against boolean literals */
    "@typescript-eslint/no-unnecessary-condition": "error",                    /* ( ft) Prevents conditionals where the type is always truthy or always falsy */
    "@typescript-eslint/no-unnecessary-qualifier": "error",                    /* ( ft) Warns when a namespace qualifier is unnecessary */
    "@typescript-eslint/no-unnecessary-type-arguments": "off",                 /* ( ft) Enforces that type arguments will not be used if not required */
    "@typescript-eslint/no-unnecessary-type-assertion": "error",               /* (rft) Warns if a type assertion does not change the type of an expression */
    "@typescript-eslint/no-unnecessary-type-constraint": "error",              /* ( f ) Disallows unnecessary constraints on generic types */
    "@typescript-eslint/no-unsafe-argument": "error",                          /* (  t) Disallows calling an function with an any type value */
    "@typescript-eslint/no-unsafe-assignment": "error",                        /* (r t) Disallows assigning any to variables and properties */
    "@typescript-eslint/no-unsafe-call": "error",                              /* (r t) Disallows calling an any type value */
    "@typescript-eslint/no-unsafe-member-access": "off",                       /* (r t) Disallows member access on any typed variables */
    "@typescript-eslint/no-unsafe-return": "error",                            /* (r t) Disallows returning any from a function */
    "@typescript-eslint/no-var-requires": "error",                             /* (r  ) Disallows the use of require statements except in import statements */
    "@typescript-eslint/non-nullable-type-assertion-style": "error",           /* ( ft) Prefers a non-null assertion over explicit type cast when possible */
    "@typescript-eslint/prefer-as-const": "error",                             /* (rf ) Prefer usage of as const over literal type */
    "@typescript-eslint/prefer-enum-initializers": "error",                    /* (   ) Prefer initializing each enums member value */
    "@typescript-eslint/prefer-for-of": "error",                               /* (   ) Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access the array being iterated */
    "@typescript-eslint/prefer-function-type": "error",                        /* ( f ) Use function types instead of interfaces with call signatures */
    "@typescript-eslint/prefer-includes": "error",                             /* ( ft) Enforce includes method over indexOf method */
    "@typescript-eslint/prefer-literal-enum-member": "error",                  /* (   ) Require that all enum members be literal values to prevent unintended enum member name shadow issues */
    "@typescript-eslint/prefer-namespace-keyword": "error",                    /* (rf ) Require the use of the namespace keyword instead of the module keyword to declare custom TypeScript modules */
    "@typescript-eslint/prefer-nullish-coalescing": "error",                   /* (  t) Enforce the usage of the nullish coalescing operator instead of logical chaining */
    "@typescript-eslint/prefer-optional-chain": "error",                       /* (   ) Prefer using concise optional chain expressions instead of chained logical ands */
    "@typescript-eslint/prefer-readonly": "off",                               /* ( ft) Requires that private members are marked as readonly if they're never modified outside of the constructor */
    "@typescript-eslint/prefer-readonly-parameter-types": "off",               /* (  t) Requires that function parameters are typed as readonly to prevent accidental mutation of inputs */
    "@typescript-eslint/prefer-reduce-type-parameter": "error",                /* ( ft) Prefer using type parameter when calling Array#reduce instead of casting */
    "@typescript-eslint/prefer-regexp-exec": "off",                            /* (rft) Enforce that RegExp#exec is used instead of String#match if no global flag is provided */
    "@typescript-eslint/prefer-string-starts-ends-with": "error",              /* ( ft) Enforce the use of String#startsWith and String#endsWith instead of other equivalent methods of checking substrings */
    "@typescript-eslint/prefer-ts-expect-error": "error",                      /* ( f ) Recommends using @ts-expect-error over @ts-ignore */
    "@typescript-eslint/promise-function-async": "error",                      /* ( ft) Requires any function or method that returns a Promise to be marked async */
    "@typescript-eslint/require-array-sort-compare": ["error", {               /* (  t) Requires Array#sort calls to always provide a compareFunction */
      "ignoreStringArrays": true
    }],
    "@typescript-eslint/restrict-plus-operands": "error",                      /* (r t) When adding two variables, operands must both be of type number or of type string */
    "@typescript-eslint/restrict-template-expressions": "off",                 /* (r t) Enforce template literal expressions to be of string type */
    "@typescript-eslint/sort-type-union-intersection-members": "off",          /* ( f ) Enforces that members of a type union/intersection are sorted alphabetically */
    "@typescript-eslint/strict-boolean-expressions": "off",                    /* ( ft) Restricts the types allowed in boolean expressions */
    "@typescript-eslint/switch-exhaustiveness-check": "error",                 /* (  t) Exhaustiveness checking in switch with union type */
    "@typescript-eslint/triple-slash-reference": "error",                      /* (r  ) Sets preference level for triple slash directives versus ES6-style import declarations */
    "@typescript-eslint/type-annotation-spacing": ["error", {                  /* ( f ) Require consistent spacing around type annotations */
      "before": false,
      "after": true,
      "overrides": { "arrow": { "before": true, "after": true } }
    }],
    "@typescript-eslint/typedef": "off",                                       /* (   ) Requires type annotations to exist */
    "@typescript-eslint/unbound-method": "error",                              /* (r t) Enforces unbound methods are called with their expected scope */
    "@typescript-eslint/unified-signatures": "error",                          /* (   ) Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter */

    //  Extension Rules
    //  In some cases, ESLint provides a rule itself, but it doesn't support TypeScript syntax; either it crashes, or it ignores the syntax, or it falsely reports against it. In these cases, we create what we call an extension rule; a rule within our plugin that has the same functionality, but also supports TypeScript.
    "@typescript-eslint/brace-style": ["error", "1tbs", {                      /* (  f) Enforce consistent brace style for blocks */
      "allowSingleLine": true
    }],
    "@typescript-eslint/comma-dangle": ["error", "always-multiline"],          /* ( f ) Require or disallow trailing comma */
    "@typescript-eslint/comma-spacing": ["error", {                            /* ( f ) Enforces consistent spacing before and after commas */
      "before": false,
      "after": true
    }],
    "@typescript-eslint/default-param-last": "error",                          /* (   ) Enforce default parameters to be last */
    "@typescript-eslint/dot-notation": "error",                                /* ( ft) enforce dot notation whenever possible */
    "@typescript-eslint/func-call-spacing": "error",                           /* ( f ) Require or disallow spacing between function identifiers and their invocations */
    "@typescript-eslint/indent": ["error", 4, {                                /* ( f ) Enforce consistent indentation */
      "SwitchCase": 1,
      "VariableDeclarator": "first",
      "outerIIFEBody": 1,
      "MemberExpression": 1,
      "FunctionDeclaration": {
        "body": 1,
        "parameters": "first"
      },
      "FunctionExpression": {
        "body": 1,
        "parameters": "first"
      },
      "CallExpression": {
        "arguments": "first"
      },
      "ArrayExpression": 1,
      "ObjectExpression": 1,
      "ImportDeclaration": "first",
      "flatTernaryExpressions": false,
      "offsetTernaryExpressions": true,
      "ignoreComments": false
    }],
    "@typescript-eslint/init-declarations": "off",                             /* (   ) require or disallow initialization in variable declarations */
    "@typescript-eslint/keyword-spacing": ["error", {                          /* ( f ) Enforce consistent spacing before and after keywords */
      "before": true,
      "after": true
    }],
    "@typescript-eslint/lines-between-class-members": ["error", "always"],     /* ( f ) Require or disallow an empty line between class members */
    "@typescript-eslint/no-array-constructor": "error",                        /* (rf ) Disallow generic Array constructors */
    "@typescript-eslint/no-dupe-class-members": "error",                       /* (   ) Disallow duplicate class members */
    "@typescript-eslint/no-duplicate-imports": "error",                        /* (   ) Disallow duplicate imports */
    "@typescript-eslint/no-empty-function": "off",                             /* (r  ) Disallow empty functions */
    "@typescript-eslint/no-extra-parens": "error",                             /* ( f ) Disallow unnecessary parentheses */
    "@typescript-eslint/no-extra-semi": "error",                               /* (rf ) Disallow unnecessary semicolons */
    "@typescript-eslint/no-implied-eval": "error",                             /* (r t) Disallow the use of eval()-like methods */
    "@typescript-eslint/no-invalid-this": "error",                             /* (   ) Disallow this keywords outside of classes or class-like objects */
    "@typescript-eslint/no-loop-func": "error",                                /* (   ) Disallow function declarations that contain unsafe references inside loop statements */
    "@typescript-eslint/no-loss-of-precision": "error",                        /* (   ) Disallow literal numbers that lose precision */
    "@typescript-eslint/no-magic-numbers": "off",                              /* (   ) Disallow magic numbers */
    "@typescript-eslint/no-redeclare": "error",                                /* (   ) Disallow variable redeclaration */
    "@typescript-eslint/no-shadow": "error",                                   /* (   ) Disallow variable declarations from shadowing variables declared in the outer scope */
    "@typescript-eslint/no-throw-literal": "error",                            /* (  t) Disallow throwing literals as exceptions */
    "@typescript-eslint/no-unused-expressions": "off",                         /* (   ) Disallow unused expressions */
    "@typescript-eslint/no-unused-vars": "error",                              /* (r  ) Disallow unused variables */
    "@typescript-eslint/no-use-before-define": "error",                        /* (   ) Disallow the use of variables before they are defined */
    "@typescript-eslint/no-useless-constructor": "error",                      /* (   ) Disallow unnecessary constructors */
    "@typescript-eslint/object-curly-spacing": ["error", "never", {            /* ( f ) Enforce consistent spacing inside braces */
      "objectsInObjects": true,
      "arraysInObjects": true
    }],
    "@typescript-eslint/quotes": ["error", "double", {                         /* ( f ) Enforce the consistent use of either backticks, double, or single quotes */
      "allowTemplateLiterals": true
    }],
    "@typescript-eslint/require-await": "off",                                 /* (r t) Disallow async functions which have no await expression */
    "@typescript-eslint/return-await": "error",                                /* ( ft) Enforces consistent returning of awaited values */
    "@typescript-eslint/semi": ["error", "always", {                           /* ( f ) Require or disallow semicolons instead of ASI */
      "omitLastInOneLineBlock": true
    }],
    "@typescript-eslint/space-before-function-paren": ["error", {              /* ( f ) Enforces consistent spacing before function parenthesis */
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "@typescript-eslint/space-infix-ops": "error",                             /* ( f ) This rule is aimed at ensuring there are spaces around infix operators. */
  }
}