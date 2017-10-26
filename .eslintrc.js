module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true,
        "es6": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-var": "error",
        "prefer-const": [
            "error",
            {
                "destructuring": "all",
                "ignoreReadBeforeAssign": false
            }
        ],
        "no-useless-concat": "warn",
        "prefer-template": "warn",
        "require-jsdoc": "warn",
        "valid-jsdoc": "warn",
        "no-tabs": "error",
        "semi-style": ["error", "last"],
        "no-lonely-if": "warn",
        "max-len": ["warn", 80],
        "eqeqeq": "error",
        "for-direction": "error",
        "block-scoped-var": "warn",
        "default-case": "error",
        "object-curly-spacing": ["error", "always"],
        "yoda": "warn",
        "handle-callback-err": "error",
        "camelcase": "warn",
        "max-nested-callbacks": ["warn", 3],
        "space-in-parens": ["warn", "never"],
        "no-console": "warn",
        "no-unused-vars": [
            "error",
            {
                "varsIgnorePattern": "should|expect"
            }
        ]
    }
};
