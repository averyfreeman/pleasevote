module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/elections.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./pages/api/elections.js":
/*!********************************!*\
  !*** ./pages/api/elections.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! googleapis */ \"googleapis\");\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(googleapis__WEBPACK_IMPORTED_MODULE_0__);\n\nconst civic = googleapis__WEBPACK_IMPORTED_MODULE_0__[\"google\"].civicinfo({\n  version: 'v2',\n  auth: process.env.GAPI_KEY\n});\nlet info;\n/* harmony default export */ __webpack_exports__[\"default\"] = (async (req, res, error) => {\n  info = await civic.elections.electionQuery({\n    officialOnly: false,\n    returnAllAvailableData: true,\n    prettyPrint: true,\n    alt: 'json'\n  });\n\n  if (typeof info === 'object') {\n    return res.status(200).json(info);\n  } else {\n    return res.status(404).json({\n      message: `electionQuery() data not found or unrecognized type`\n    });\n  } // return res.status(200).json(info);\n\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9hcGkvZWxlY3Rpb25zLmpzP2RlNWYiXSwibmFtZXMiOlsiY2l2aWMiLCJnb29nbGUiLCJjaXZpY2luZm8iLCJ2ZXJzaW9uIiwiYXV0aCIsInByb2Nlc3MiLCJlbnYiLCJHQVBJX0tFWSIsImluZm8iLCJyZXEiLCJyZXMiLCJlcnJvciIsImVsZWN0aW9ucyIsImVsZWN0aW9uUXVlcnkiLCJvZmZpY2lhbE9ubHkiLCJyZXR1cm5BbGxBdmFpbGFibGVEYXRhIiwicHJldHR5UHJpbnQiLCJhbHQiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQUE7QUFFQSxNQUFNQSxLQUFLLEdBQUdDLGlEQUFNLENBQUNDLFNBQVAsQ0FBaUI7QUFDN0JDLFNBQU8sRUFBRSxJQURvQjtBQUU3QkMsTUFBSSxFQUFFQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUM7QUFGVyxDQUFqQixDQUFkO0FBS0EsSUFBSUMsSUFBSjtBQUNlLHNFQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFBaUJDLEtBQWpCLEtBQTJCO0FBQ3hDSCxNQUFJLEdBQUcsTUFBTVIsS0FBSyxDQUFDWSxTQUFOLENBQWdCQyxhQUFoQixDQUE4QjtBQUN6Q0MsZ0JBQVksRUFBRSxLQUQyQjtBQUV6Q0MsMEJBQXNCLEVBQUUsSUFGaUI7QUFHekNDLGVBQVcsRUFBRSxJQUg0QjtBQUl6Q0MsT0FBRyxFQUFFO0FBSm9DLEdBQTlCLENBQWI7O0FBT0EsTUFBSSxPQUFPVCxJQUFQLEtBQWdCLFFBQXBCLEVBQThCO0FBQzVCLFdBQU9FLEdBQUcsQ0FBQ1EsTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCWCxJQUFyQixDQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBT0UsR0FBRyxDQUFDUSxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUI7QUFDMUJDLGFBQU8sRUFBRztBQURnQixLQUFyQixDQUFQO0FBR0QsR0FkdUMsQ0FnQnhDOztBQUNELENBakJEIiwiZmlsZSI6Ii4vcGFnZXMvYXBpL2VsZWN0aW9ucy5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdvb2dsZSB9IGZyb20gJ2dvb2dsZWFwaXMnO1xuXG5jb25zdCBjaXZpYyA9IGdvb2dsZS5jaXZpY2luZm8oe1xuICB2ZXJzaW9uOiAndjInLFxuICBhdXRoOiBwcm9jZXNzLmVudi5HQVBJX0tFWSxcbn0pO1xuXG5sZXQgaW5mbztcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXEsIHJlcywgZXJyb3IpID0+IHtcbiAgaW5mbyA9IGF3YWl0IGNpdmljLmVsZWN0aW9ucy5lbGVjdGlvblF1ZXJ5KHtcbiAgICBvZmZpY2lhbE9ubHk6IGZhbHNlLFxuICAgIHJldHVybkFsbEF2YWlsYWJsZURhdGE6IHRydWUsXG4gICAgcHJldHR5UHJpbnQ6IHRydWUsXG4gICAgYWx0OiAnanNvbicsXG4gIH0pO1xuXG4gIGlmICh0eXBlb2YgaW5mbyA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oaW5mbyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcbiAgICAgIG1lc3NhZ2U6IGBlbGVjdGlvblF1ZXJ5KCkgZGF0YSBub3QgZm91bmQgb3IgdW5yZWNvZ25pemVkIHR5cGVgLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKGluZm8pO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/api/elections.js\n");

/***/ }),

/***/ "googleapis":
/*!*****************************!*\
  !*** external "googleapis" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"googleapis\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJnb29nbGVhcGlzXCI/MzExYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJnb29nbGVhcGlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ29vZ2xlYXBpc1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///googleapis\n");

/***/ })

/******/ });