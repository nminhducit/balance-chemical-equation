"use strict";
var formulaElem = document.getElementById("inputFormula");
function doBalance() {
    var msgElem = document.getElementById("message");
    var balancedElem = document.getElementById("balanced");
    var codeOutElem = document.getElementById("codeOutput");
    msgElem.textContent = "";
    while (balancedElem.firstChild != null)
        balancedElem.removeChild(balancedElem.firstChild);
    while (codeOutElem.firstChild != null)
        codeOutElem.removeChild(codeOutElem.firstChild);
    codeOutElem.textContent = " ";
    var formulaStr = formulaElem.value;
    var eqn;
    try {
        eqn = new Parser(formulaStr).parseEquation();
    }
    catch (e) {
        if (typeof e == "string") { 
            msgElem.textContent = "Lỗi cú pháp: " + e;
        }
        else if ("start" in e) {
            msgElem.textContent = "Lỗi cú pháp: " + e.message;
            var start = e.start;
            var end = "end" in e ? e.end : e.start;
            while (end > start && [" ", "\t"].indexOf(formulaStr.charAt(end - 1)) != -1)
                end--;
            if (start == end)
                end++;
            codeOutElem.textContent += formulaStr.substr(0, start);
            if (end <= formulaStr.length) {
                codeOutElem.appendChild(createElem("u", formulaStr.substring(start, end)));
                codeOutElem.appendChild(document.createTextNode(formulaStr.substring(end, formulaStr.length)));
            }
            else
                codeOutElem.appendChild(createElem("u", " "));
        }
        else {
            msgElem.textContent = "Lỗi xác nhận";
        }
        return;
    }
    try {
        var matrix = buildMatrix(eqn);
        solve(matrix); 
        var coefs = extractCoefficients(matrix);
        checkAnswer(eqn, coefs); 
        balancedElem.appendChild(eqn.toHtml(coefs)); 
    }
    catch (e) {
        msgElem.textContent = e.toString();
    }
}
function doDemo(formulaStr) {
    formulaElem.value = formulaStr;
    doBalance();
}
var RANDOM_DEMOS = [
    "NO + O2 = NO2",
    "Na2O + H2O = NaOH",
    "Ca(OH)2 + Na2CO3 = CaCO3 + NaOH",
    "Fe2O3 + H2 = Fe + H2O",
    "Mg(OH)2 + HCl = MgCl2 + H2O",
    "FeI3 = FeI2 + I2",
    "AgNO3 + K3PO4 = Ag3PO4 + KNO3",
    "SO2 + Ba(OH)2 = BaSO3 + H2O",
    "Ag + Cl2 = AgCl",
    "FeS + HCl = FeCl2 + H2S",
    "P2O5 + H2O = H3PO4",
    "HgO = Hg + O2",
    "FeS2 + O2 = Fe2O3 + SO2",
    "KOH + Al2(SO4)3 = K2SO4 + Al(OH)3",
    "FexOy + CO = FeO + CO2",
    "Al + Fe3O4 = Al2O3 + Fe",
    "Na + H2O = NaOH + H2",
    "Fe3O4 + HCl = FeCl2+ FeCl3 + H2O",
    "Al2O3 + H2SO4 = Al2(SO4)3 + H2O",
    "KMnO4 = K2MnO4 + MnO2 + O2",
    "Fe(OH)2 + O2+ H2O = Fe(OH)3",
    "Fe3O4 + CO = Fe + CO2",
    "Fe3O4 + H2SO4 = FeSO4 + Fe2(SO4)3 + H2O",
    "NO2 + O2 + H2O = HNO3",
    "C4H10 + O2 = CO2 + H2O",
    "CnH2n+2 + O2 = CO2 + H2O",
    "CnH2n + O2 = CO2 + H2O",
    "CnH2n-2 + O2 = CO2 + H2O",
    "CxHy + O2 = CO2 + H2O",
    "CxHyOz + O2 = CO2 + H2O",
    "CH3COOH + O2 = CO2 + H2O",
    "(HO)2CnHm(COOH)2 + O2 = CO2 + H2O",
    "CxHyCOOH + O2 = CO2 + H2O",
    "Fe3O4 + CO = Fe + CO2",
    "FeSO4 + K2Cr2O7 + H2SO4 = Fe2(SO4)3 + K2SO4 + Cr2(SO4)3 + H2O",
    "Cu + HNO3 = Cu(NO3)2 + NO + H2O",
    "Fe3O4 + HNO3 = Fe(NO3)3 + NO + H2O",
    "S + HNO3 = H2SO4 + NO",
    "C + HNO3 = CO2 + NO + H2O",
    "H2SO4 + H2S = S + H2O",
    "Cr2O3 + KNO3 + KOH = K2CrO4 + KNO2 + H2O",
    "H2S + HClO3 = HCl + H2SO4",
    "NH3 + O2 = NO + H2O",
    "Fe + HNO3 = Fe(NO3)3 + N2O + H2O",
    "Cu + H2SO4 = CuSO4 + SO2 + H2O",
    "K2S + KMnO4 + H2SO4 = S + H2SO4 + K2SO4 + H2O",
    "Mg + HNO3 = Mg(NO3)3 + NH4NO3 + H2O",
    "CuS2 + HNO3 = Cu(NO3)2 + H2SO4 + N2O + H2O",
    "FeSO4 + Cl2 + H2SO4 = Fe2(SO4)3 + HCl",
    "Zn + HNO3 = Zn(NO3)2 + NO + NO2 + H2O",
    "FeS2 + HNO3 = Fe(NO3)3 + NO + H2SO4 + H2O",
    "KClO3 + NH3 = KNO3 + KCl + Cl2 + H2O",
    "KNO3 + C+ S = K2S + N2 + CO2",
    "FeSO4 + K2Cr2O7 + H2SO4 = Fe2(SO4)3 + K2SO4 + Cr2(SO4)2 + H2O",
    "Na2SO3 + KMnO4 + H2O = Na2SO4 + MnO2 + KOH",
    "As2S3 + HNO3 + H2O = H3AsO4 + NO + H2SO4",
    "CH3CH2OH + K2Cr2O7 + H2SO4 = CH3COOH + Cr2(SO4)3 + K2SO4 + H2O",
    "KClO3 = KCl + O2",
    "AgNO3 = Ag + NO2 + O2",
    "HNO3 = NO2 + O2 + H2O",
    "KMnO4 = K2MnO4 + O2 + MnO2",
    "FeS + KNO3 = KNO2 + Fe2O3 + SO3",
    "Cu2S + HNO3 = NO + Cu(NO3)2 + CuSO4 + H2O",
    "FeS + H2SO4 = Fe2(SO4)3 + S + SO2 + H2O",
    "M + HNO3 = M(NO3)n + NO2­ + H2O",
    "Zn + HNO3 + H2O = (Zn(H2O)4)NO3 + H2",
    "Zn + HNO3 + H2O = H2ZnO3 + NO",
    "Zn + HNO3 + H2O = NH4NO3 + Zn(NO3)2 + H2O",
    "Zn + HNO3 + H2O = Zn(NO3)2 + H3O",
    "Zn + HNO3 + H2O = Zn(OH)2 + NO",
    "Zn + HNO3 + H2O = Zn(OH)4 + NH3",
    "Zn + HNO3 + H2O2 = Zn(NO3)2 + H2O",
    "Zn + HNO3 + H2SO3 = N2O + ZnSO3 + H2O",
    "S + O + H = SOH2",
    "C4H10O + K2Cr2O7 + H2SO4 = C2H6O + K2SO4 + Cr2(SO4)3 + H2O + CO2",
    "AgCu + HNO3 = AgNO3 + Cu(NO3)2 + H2",
    "C3H6O3 + AgNO3 = C3H5AgO3 + HNO3",
    "N2 + O2 = NO",
    "Cu(NO3)2 + NaOH = Cu(OH)2 + NaNO3",
    "Fe2O3 + H2SO4 = Fe2(SO4)3 + H2O",
    "FeO + HCl = FeCl2 + H2O",
    "Cu(OH)2 + H2SO4 = CuSO4 + H2O",
    "Cu(OH)2 + HCl = CuCl2 + H2O",
    "P + O2 = P2O5",
    "Al + Cl2 = AlCl3",
    "Fe(OH)3 = Fe2O3 + H2O",
    "Al2(SO4)3 + BaCl2 = BaSO4+ AlCl3",
    "H2 + O2 = H2O",
    "Fe + O2 = Fe2O3",
    "NH3 + O2 = N2 + H2O",
    "C2H2 + O2 = CO2 + H2O",
    "C3H8O + O2 = CO2 + H2O",
    "Na + O2 = Na2O",
    "P4 + O2 = P2O5",
    "Na2O + H2O = NaOH",
    "Mg + HCl = MgCl2 + H2",
    "AgNO3 + LiOH = AgOH + LiNO3",
    "Pb + PbO2 + H^+ + SO4^2- = PbSO4 + H2O",
    "HNO3 + Cu = Cu(NO3)2 + H2O + NO",
    "KNO2 + KNO3 + Cr2O3 = K2CrO4 + NO",
    "AgNO3 + BaCl2 = Ba(NO3)2 + AgCl",
    "Cu(NO3)2 = CuO + NO2 + O2",
    "Al + CuSO4 = Al2(SO4)3 + Cu",
    "Na3PO4 + Zn(NO3)2 = NaNO3 + Zn3(PO4)2",
    "Cl2 + Ca(OH)2 = Ca(ClO)2 + CaCl2 + H2O",
    "CHCl3 + O2 = CO2 + H2O + Cl2",
    "H2C2O4 + MnO4^- = H2O + CO2 + MnO + OH^-",
    "H2O2 + Cr2O7^2- = Cr^3+ + O2 + OH^-",
    "KBr + KMnO4 + H2SO4 = Br2 + MnSO4 + K2SO4 + H2O",
    "K2Cr2O7 + KI + H2SO4 = Cr2(SO4)3 + I2 + H2O + K2SO4",
    "KClO3 + KBr + HCl = KCl + Br2 + H2O",
    "Ag + HNO3 = AgNO3 + NO + H2O",
    "P4 + OH^- + H2O = H2PO2^- + P2H4",
    "Zn + NO3^- + H^+ = Zn^2+ + NH4^+ + H2O",
    "ICl + H2O = Cl^- + IO3^- + I2 + H^+",
];
var lastRandomIndex = -1;
function doRandom() {
    var index;
    do {
        index = Math.floor(Math.random() * RANDOM_DEMOS.length);
        index = Math.max(Math.min(index, RANDOM_DEMOS.length - 1), 0);
    } while (RANDOM_DEMOS.length >= 2 && index == lastRandomIndex);
    lastRandomIndex = index;
    doDemo(RANDOM_DEMOS[index]);
}
var Parser =(function () {
    function Parser(formulaStr) {
        this.tok = new Tokenizer(formulaStr);
    }
    Parser.prototype.parseEquation = function () {
        var lhs = [this.parseTerm()];
        while (true) {
            var next = this.tok.peek();
            if (next == "+") {
                this.tok.consume(next);
                lhs.push(this.parseTerm());
            }
            else if (next == "=") {
                this.tok.consume(next);
                break;
            }
            else
                throw { message: "Plus or equal sign expected", start: this.tok.pos };
        }
        var rhs = [this.parseTerm()];
        while (true) {
            var next = this.tok.peek();
            if (next == null)
                break;
            else if (next == "+") {
                this.tok.consume(next);
                rhs.push(this.parseTerm());
            }
            else
                throw { message: "Thêm hoặc kết thúc dự kiến", start: this.tok.pos };
        }
        return new Equation(lhs, rhs);
    };

    Parser.prototype.parseTerm = function () {
        var startPos = this.tok.pos;

        var items = [];
        var electron = false;
        var next;
        while (true) {
            next = this.tok.peek();
            if (next == "(")
                items.push(this.parseGroup());
            else if (next == "e") {
                this.tok.consume(next);
                electron = true;
            }
            else if (next != null && /^[A-Z][a-z]*$/.test(next))
                items.push(this.parseElement());
            else if (next != null && /^[0-9]+$/.test(next))
                throw { message: "Điều khoản không và số lượng không hợp lệ", start: this.tok.pos };
            else
                break;
        }

        var charge = null;
        if (next == "^") {
            this.tok.consume(next);
            next = this.tok.peek();
            if (next == null)
                throw { message: "Số hoặc dấu không hợp lệ", start: this.tok.pos };
            else {
                charge = this.parseOptionalNumber();
                next = this.tok.peek();
            }
            if (next == "+")
                charge = +charge;
            else if (next == "-")
                charge = -charge;
            else
                throw { message: "Sign expected", start: this.tok.pos };
            this.tok.take(); 
        }

        if (electron) {
            if (items.length > 0)
                throw { message: "Thuật ngữ không hợp lệ - Electron cần đứng một mình", start: startPos, end: this.tok.pos };
            if (charge == null) 
                charge = -1;
            if (charge != -1)
                throw { message: "Thời hạn không hợp lệ - Điện tích không hợp lệ", start: startPos, end: this.tok.pos };
        }
        else {
            if (items.length == 0)
                throw { message: "Cụm từ không hợp lệ - Trống", start: startPos, end: this.tok.pos };
            if (charge == null)
                charge = 0;
        }
        return new Term(items, charge);
    };

    Parser.prototype.parseGroup = function () {
        var startPos = this.tok.pos;
        this.tok.consume("(");
        var items = [];
        while (true) {
            var next = this.tok.peek();
            if (next == "(")
                items.push(this.parseGroup());
            else if (next != null && /^[A-Z][a-z]*$/.test(next))
                items.push(this.parseElement());
            else if (next == ")") {
                this.tok.consume(next);
                if (items.length == 0)
                    throw { message: "Trống nhóm chất", start: startPos, end: this.tok.pos };
                break;
            }
            else
                throw { message: "Phần tử, nhóm hoặc dấu ngoặc đóng", start: this.tok.pos };
        }
        return new Group(items, this.parseOptionalNumber());
    };
    Parser.prototype.parseElement = function () {
        var name = this.tok.take();
        if (!/^[A-Z][a-z]*$/.test(name))
            throw "Assertion error";
        return new ChemElem(name, this.parseOptionalNumber());
    };

    Parser.prototype.parseOptionalNumber = function () {
        var next = this.tok.peek();
        if (next != null && /^[0-9]+$/.test(next))
            return checkedParseInt(this.tok.take());
        else
            return 1;
    };
    return Parser;
}());
var Tokenizer = (function () {
    function Tokenizer(str) {
        this.str = str.replace(/\u2212/g, "-");
        this.pos = 0;
        this.skipSpaces();
    }
    Tokenizer.prototype.peek = function () {
        if (this.pos == this.str.length) 
            return null;
        var match = /^([A-Za-z][a-z]*|[0-9]+|[+\-^=()])/.exec(this.str.substring(this.pos));
        if (match == null)
            throw { message: "Biểu tượng không hợp lệ", start: this.pos };
        return match[0];
    };
    Tokenizer.prototype.take = function () {
        var result = this.peek();
        if (result == null)
            throw "Advancing beyond last token";
        this.pos += result.length;
        this.skipSpaces();
        return result;
    };
    Tokenizer.prototype.consume = function (s) {
        if (this.take() != s)
            throw "Mã thông báo không khớp";
    };
    Tokenizer.prototype.skipSpaces = function () {
        var match = /^[ \t]*/.exec(this.str.substring(this.pos));
        if (match === null)
            throw "Lỗi xác nhận";
        this.pos += match[0].length;
    };
    return Tokenizer;
}());
var Equation =(function () {
    function Equation(lhs, rhs) {
        this.leftSide = lhs.slice();
        this.rightSide = rhs.slice();
    }
    Equation.prototype.getElements = function () {
        var result = new Set();
        for (var _i = 0, _a = this.leftSide.concat(this.rightSide); _i < _a.length; _i++) {
            var item = _a[_i];
            item.getElements(result);
        }
        return Array.from(result);
    };
    Equation.prototype.toHtml = function (coefs) {
        if (coefs !== undefined && coefs.length != this.leftSide.length + this.rightSide.length)
            throw "Hệ số không khớp";
        var node = document.createDocumentFragment();
        var j = 0;
        function termsToHtml(terms) {
            var head = true;
            for (var _i = 0, terms_1 = terms; _i < terms_1.length; _i++) {
                var term = terms_1[_i];
                var coef = coefs !== undefined ? coefs[j] : 1;
                if (coef != 0) {
                    if (head)
                        head = false;
                    else
                        node.appendChild(createSpan("thêm", " + "));
                    if (coef != 1) {
                        var span = createSpan("coefficient", coef.toString().replace(/-/, MINUS));
                        if (coef < 0)
                            span.classList.add("negative");
                        node.appendChild(span);
                    }
                    node.appendChild(term.toHtml());
                }
                j++;
            }
        }
        termsToHtml(this.leftSide);
        node.appendChild(createSpan("rightarrow", " \u2192 "));
        termsToHtml(this.rightSide);
        return node;
    };
    return Equation;
}());
var Term = (function () {
    function Term(items, charge) {
        if (items.length == 0 && charge != -1)
            throw "Điều khoản không hợp lệ"; 
        this.items = items.slice();
        this.charge = charge;
    }
    Term.prototype.getElements = function (resultSet) {
        resultSet.add("e");
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            item.getElements(resultSet);
        }
    };
    Term.prototype.countElement = function (name) {
        if (name == "e") {
            return -this.charge;
        }
        else {
            var sum = 0;
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                sum = checkedAdd(sum, item.countElement(name));
            }
            return sum;
        }
    };
    Term.prototype.toHtml = function () {
        var node = createSpan("term");
        if (this.items.length == 0 && this.charge == -1) {
            node.textContent = "e";
            node.appendChild(createElem("sup", MINUS));
        }
        else {
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                node.appendChild(item.toHtml());
            }
            if (this.charge != 0) {
                var s = void 0;
                if (Math.abs(this.charge) == 1)
                    s = "";
                else
                    s = Math.abs(this.charge).toString();
                if (this.charge > 0)
                    s += "+";
                else
                    s += MINUS;
                node.appendChild(createElem("sup", s));
            }
        }
        return node;
    };
    return Term;
}());
var Group =(function () {
    function Group(items, count) {
        if (count < 1)
            throw "Lỗi xác nhận: Số lượng phải là một số nguyên dương";
        this.items = items.slice();
        this.count = count;
    }
    Group.prototype.getElements = function (resultSet) {
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            item.getElements(resultSet);
        }
    };
    Group.prototype.countElement = function (name) {
        var sum = 0;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            sum = checkedAdd(sum, checkedMultiply(item.countElement(name), this.count));
        }
        return sum;
    };
    Group.prototype.toHtml = function () {
        var node = createSpan("group", "(");
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            node.appendChild(item.toHtml());
        }
        node.appendChild(document.createTextNode(")"));
        if (this.count != 1)
            node.appendChild(createElem("sub", this.count.toString()));
        return node;
    };
    return Group;
}());
var ChemElem =  (function () {
    function ChemElem(name, count) {
        if (count < 1)
            throw "Lỗi xác nhận: Số lượng phải là một số nguyên dương";
        this.name = name;
        this.count = count;
    }
    ChemElem.prototype.getElements = function (resultSet) {
        resultSet.add(this.name);
    };
    ChemElem.prototype.countElement = function (n) {
        return n == this.name ? this.count : 0;
    };
    ChemElem.prototype.toHtml = function () {
        var node = createSpan("element", this.name);
        if (this.count != 1)
            node.appendChild(createElem("sub", this.count.toString()));
        return node;
    };
    return ChemElem;
}());
var Matrix = (function () {
    function Matrix(rows, cols) {
        if (rows < 0 || cols < 0)
            throw "Illegal argument";
        this.numRows = rows;
        this.numCols = cols;

        var row = [];
        for (var j = 0; j < cols; j++)
            row.push(0);
        this.cells = []; 
        for (var i = 0; i < rows; i++)
            this.cells.push(row.slice());
    }

    Matrix.prototype.get = function (r, c) {
        if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
            throw "Chỉ số nằm ngoài giới hạn";
        return this.cells[r][c];
    };

    Matrix.prototype.set = function (r, c, val) {
        if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
            throw "Chỉ số nằm ngoài giới hạn";
        this.cells[r][c] = val;
    };

    Matrix.prototype.swapRows = function (i, j) {
        if (i < 0 || i >= this.numRows || j < 0 || j >= this.numRows)
            throw "Chỉ số nằm ngoài giới hạn";
        var temp = this.cells[i];
        this.cells[i] = this.cells[j];
        this.cells[j] = temp;
    };

    Matrix.addRows = function (x, y) {
        var z = [];
        for (var i = 0; i < x.length; i++)
            z.push(checkedAdd(x[i], y[i]));
        return z;
    };

    Matrix.multiplyRow = function (x, c) {
        return x.map(function (val) {
            return checkedMultiply(val, c);
        });
    };

    Matrix.gcdRow = function (x) {
        var result = 0;
        for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
            var val = x_1[_i];
            result = gcd(val, result);
        }
        return result;
    };
    Matrix.simplifyRow = function (x) {
        var sign = 0;
        for (var _i = 0, x_2 = x; _i < x_2.length; _i++) {
            var val = x_2[_i];
            if (val != 0) {
                sign = Math.sign(val);
                break;
            }
        }
        if (sign == 0)
            return x.slice();
        var g = Matrix.gcdRow(x) * sign;
        return x.map(function (val) { return val / g; });
    };

    Matrix.prototype.gaussJordanEliminate = function () {

        var cells = this.cells = this.cells.map(Matrix.simplifyRow);
  
        var numPivots = 0;
        for (var i = 0; i < this.numCols; i++) {

            var pivotRow = numPivots;
            while (pivotRow < this.numRows && cells[pivotRow][i] == 0)
                pivotRow++;
            if (pivotRow == this.numRows)
                continue;
            var pivot = cells[pivotRow][i];
            this.swapRows(numPivots, pivotRow);
            numPivots++;

            for (var j = numPivots; j < this.numRows; j++) {
                var g = gcd(pivot, cells[j][i]);
                cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][i] / g)));
            }
        }

        for (var i = this.numRows - 1; i >= 0; i--) {
 
            var pivotCol = 0;
            while (pivotCol < this.numCols && cells[i][pivotCol] == 0)
                pivotCol++;
            if (pivotCol == this.numCols)
                continue;
            var pivot = cells[i][pivotCol];

            for (var j = i - 1; j >= 0; j--) {
                var g = gcd(pivot, cells[j][pivotCol]);
                cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][pivotCol] / g)));
            }
        }
    };
    return Matrix;
}());

function buildMatrix(eqn) {
    var elems = eqn.getElements();
    var lhs = eqn.leftSide;
    var rhs = eqn.rightSide;
    var matrix = new Matrix(elems.length + 1, lhs.length + rhs.length + 1);
    elems.forEach(function (elem, i) {
        var j = 0;
        for (var _i = 0, lhs_1 = lhs; _i < lhs_1.length; _i++) {
            var term = lhs_1[_i];
            matrix.set(i, j, term.countElement(elem));
            j++;
        }
        for (var _a = 0, rhs_1 = rhs; _a < rhs_1.length; _a++) {
            var term = rhs_1[_a];
            matrix.set(i, j, -term.countElement(elem));
            j++;
        }
    });
    return matrix;
}
function solve(matrix) {
    matrix.gaussJordanEliminate();
    function countNonzeroCoeffs(row) {
        var count = 0;
        for (var i_1 = 0; i_1 < matrix.numCols; i_1++) {
            if (matrix.get(row, i_1) != 0)
                count++;
        }
        return count;
    }

    var i;
    for (i = 0; i < matrix.numRows - 1; i++) {
        if (countNonzeroCoeffs(i) > 1)
            break;
    }
    if (i == matrix.numRows - 1)
        throw "Không hợp lệ"; 

    matrix.set(matrix.numRows - 1, i, 1);
    matrix.set(matrix.numRows - 1, matrix.numCols - 1, 1);
    matrix.gaussJordanEliminate();
}
function extractCoefficients(matrix) {
    var rows = matrix.numRows;
    var cols = matrix.numCols;
    if (cols - 1 > rows || matrix.get(cols - 2, cols - 2) == 0)
        throw "Nhiều giải pháp độc lập";
    var lcm = 1;
    for (var i = 0; i < cols - 1; i++)
        lcm = checkedMultiply(lcm / gcd(lcm, matrix.get(i, i)), matrix.get(i, i));
    var coefs = [];
    var allzero = true;
    for (var i = 0; i < cols - 1; i++) {
        var coef = checkedMultiply(lcm / matrix.get(i, i), matrix.get(i, cols - 1));
        coefs.push(coef);
        allzero = allzero && coef == 0;
    }
    if (allzero)
        throw "Lỗi xác nhận: Không hợp lệ";
    return coefs;
}

function checkAnswer(eqn, coefs) {
    if (coefs.length != eqn.leftSide.length + eqn.rightSide.length)
        throw "Lỗi xác nhận: Độ dài không khớp";
    var allzero = true;
    for (var _i = 0, coefs_1 = coefs; _i < coefs_1.length; _i++) {
        var coef = coefs_1[_i];
        if (typeof coef != "number" || isNaN(coef) || Math.floor(coef) != coef)
            throw "Lỗi xác nhận: Không phải số nguyên";
        allzero = allzero && coef == 0;
    }
    if (allzero)
        throw "Lỗi xác nhận: Không hợp lệ";
    for (var _a = 0, _b = eqn.getElements(); _a < _b.length; _a++) {
        var elem = _b[_a];
        var sum = 0;
        var j = 0;
        for (var _c = 0, _d = eqn.leftSide; _c < _d.length; _c++) {
            var term = _d[_c];
            sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), coefs[j]));
            j++;
        }
        for (var _e = 0, _f = eqn.rightSide; _e < _f.length; _e++) {
            var term = _f[_e];
            sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), -coefs[j]));
            j++;
        }
        if (sum != 0)
            throw "Lỗi xác nhận: Số dư không chính xác";
    }
}

var INT_MAX = 9007199254740992;

function checkedParseInt(str) {
    var result = parseInt(str, 10);
    if (isNaN(result))
        throw "Không phải là một số";
    return checkOverflow(result);
}

function checkedAdd(x, y) {
    return checkOverflow(x + y);
}

function checkedMultiply(x, y) {
    return checkOverflow(x * y);
}

function checkOverflow(x) {
    if (Math.abs(x) >= INT_MAX)
        throw "Tràn số học";
    return x;
}

function gcd(x, y) {
    if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
        throw "Đối số không hợp lệ";
    x = Math.abs(x);
    y = Math.abs(y);
    while (y != 0) {
        var z = x % y;
        x = y;
        y = z;
    }
    return x;
}

var MINUS = "\u2212"; 

function createElem(tagName, text) {
    var result = document.createElement(tagName);
    if (text !== undefined)
        result.textContent = text;
    return result;
}

function createSpan(cls, text) {
    var result = createElem("span", text);
    result.className = cls;
    return result;
}

if (!("sign" in Math))
    Math.sign = function (x) { return x > 0 ? 1 : (x < 0 ? -1 : 0); };
if (!("from" in Array)) {
    Array.from = function (set) {
        var result = [];
        set.forEach(function (obj) { return result.push(obj); });
        return result;
    };
}
