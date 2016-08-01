 /**
  * calculate.js
  * by Ted Morin
  * 
  * contains a function to turn a div into a the NNT calculator for nonstatins paper
  * expects div id passed as an argument
  **/
  
  // TODO add support for older IE in dynamic build of Sex input
  // TODO change the 5 and 10 year risk displays to show "greater than or equal to" ( >= ) instead of ">"
  // TODO make it so that add or removing a risk factor does not require rebuilding the whole lists!

function NNTcalculator(div_id) {
  
  // "global" variables
  this.inputs = {};     // inputs to check 
  this.formData = {
    'ismale' : 0, 
    'clinASCVD': 0, 
    'metabSyndrome': 0,
    'diabetic': 0,
    'antihyp': 0,
    'coronHeartDis': 0,
    'CVC': 0,
    'arterDisease': 0,
    'histStroke': 0,
    'ACShist': 0,
    'CKD': 0
  };
  this.riskfactorKeys = [];       // keys for selected risk factors
  this.riskfactorTableRows = [];  // risk factor table rows
  this.selectorKeys = [ // useable keys
      'notadding', 
      'diabetic',
      'recentACS',
      'uncontrolled_ASCVD',
      'fam_hypercholesterolemia',
      'CKD'
  ]; 
  this.selectorNames = { // maps useable keys to names
      'notadding':'---',
      'diabetic':'Diabetes',
      'recentACS' : 'Recent ACS (<3 months)',
      'uncontrolled_ASCVD': 'Poorly Controlled ASCVD Risk Factors',
      'fam_hypercholesterolemia': 'Familial Hypercholesterolemia',
      'CKD' : 'Chronic Kidney Disease'
  }; 
  
  
  // function NNTdata: calculates the NNT and risk info for the calculator
  // expects a hash table with all risk factors
  this.NNTdata = function (data) {
    var leastrisk = 1.0;
    /**
     * finds the least risk and return output calculated from it
     *
     * i.e. the lower bound of risk for the patient's WORST risk category
     **/
    // ASCVD
    if (data['clinASCVD']){
      if ((data['diabetic']) || (data['recentACS']) || (data['uncontrolled_ASCVD']) || (data['CKD']) || (data['LDLC'] >= 190) || (data['fam_hypercholesterolemia'])) {
        leastrisk = 0.15; // with comorbidities
        return this.NNTcalculation(leastrisk, data['LDLC'], data['percentLDLCreduction']);
      } else {
        leastrisk = 0.10; // without comorbidities
        return this.NNTcalculation(leastrisk, data['LDLC'], data['percentLDLCreduction']);
      }
    } else if ((data['fam_hypercholesterolemia']) || (data['LDLC'] >= 190)) {
      leastrisk = 0.10; // certain comorbidities alone
      return this.NNTcalculation(leastrisk, data['LDLC'], data['percentLDLCreduction']);
    } else {
      leastrisk = 0.05;
      return this.NNTcalculation(leastrisk, data['LDLC'], data['percentLDLCreduction']);
    }
  }
  
  // function NNTcalculation: performs the specific calculation for NNT within NNTdata
  this.NNTcalculation = function (riskval, LDLC, percentLDLCreduction) {   
    var NNT = 1.0 /(riskval*0.21*LDLC/38.61*percentLDLCreduction) ;
    NNT = Math.round(NNT);
    var risklevel = "MODERATE";
    if(riskval >= 0.1 ) risklevel = "HIGH";
    if(riskval >= 0.15) risklevel = "VERY HIGH";
    return {'NNT':NNT,'risk':riskval,'risklevel':risklevel};
  }
  
  // function makeSelector: makes the risk factor selector
  this.makeSelector = function(table) {
    var selector = this.makeElem("select");
    for (var i in this.selectorKeys) {
      var opt = this.makeElem("option");
      opt.setAttribute("name",this.selectorKeys[i]);
      opt.appendChild(document.createTextNode(this.selectorNames[this.selectorKeys[i]]));
      selector.appendChild(opt);
    }
    var _this = this;
    selector.addEventListener("change", function(){_this.onformsubmission()});
    
    var label = this.makeElem("td");
    label.setAttribute("style","font-size:15;text-align:right;padding-right:10px;width:115px");
    label.appendChild(document.createTextNode("Add Risk Factor:"));
    var selector_cell = this.makeElem("td");
    selector_cell.setAttribute("style", "text-align:center;width:250px");
    selector_cell.appendChild(selector);
    var tr = this.makeElem("tr");
    tr.appendChild(label);
    tr.appendChild(selector_cell);
    var nodes = table.childNodes;
    if (nodes.length > 0) {
      table.childNodes[0].remove();
    }
    table.appendChild(tr);
    return selector;
  } 
  
  // function makeRFlist: makes the dynamic list of current risk factors
  this.makeRFlist = function (table) {
    table.innerHTML = "";
    for (var i in this.riskfactorKeys) {
      // removal button
      var remove = this.makeElem("button");
      remove.appendChild(document.createTextNode("Remove"));
      var _this = this;
      remove.addEventListener("click", function() {
        _this.removeRiskFactor(_this.riskfactorKeys[i]);
        _this.onformsubmission();  
      });
      var remove_cell = this.makeElem("td");
      remove_cell.setAttribute("style", "font-size:15;text-align:right;padding-right:10px;width:115px");
      remove_cell.appendChild(remove);
      // display risk factor name
      var display_cell = this.makeElem("td");
      display_cell.setAttribute("style", "text-align:center;width:250px");
      var rfname = this.selectorNames[this.riskfactorKeys[i]];
      display_cell.appendChild(document.createTextNode(rfname));
      // table row for the cells
      var tr = this.makeElem("tr");
      tr.setAttribute("name", this.riskfactorKeys[i]);
      tr.appendChild(remove_cell);
      tr.appendChild(display_cell);
      table.appendChild(tr);
    }
  }
  
  
  // function makeElem: returns document.createElement(), but adds class NNTcalculator to the tag name
  this.makeElem = function (tagname) {
    var newElem = document.createElement(tagname)
    newElem.setAttribute("class", "NNTcalculator");
    return newElem;
  }
  
  // function make input: returns an input table row
  this.makeInput = function(table, title, inpname, inptype, lower, upper, defaultval) {
  
    var tr = this.makeElem("tr");
    var titlecell = this.makeElem("td");  // title of the input
    titlecell.appendChild(document.createTextNode(title + ":"));
    titlecell.setAttribute("style","font-size:15;text-align:right;padding-right:10px;width:115px");
    tr.appendChild(titlecell);
    var cell = this.makeElem("td");
    var input = this.makeElem("input")
    input.setAttribute("type",inptype);
    input.setAttribute("name",inpname);
    // radio inputs (Sex)
    if (inptype == "radio") {
      // ensure that true and false options have been passed
      if ((lower === null) || (upper === null)){
        console.log("insufficient input");
        return ;
      }
      input.setAttribute("checked",true);
      var input2 = this.makeElem("input");
      input2.setAttribute("type",inptype);
      input2.setAttribute("name",inpname);
      cell.setAttribute("style","text-align:right;width:145px");
      cell.appendChild(input);
      cell.appendChild(document.createTextNode(upper));
      cell.appendChild(input2);
      cell.appendChild(document.createTextNode(lower));
      tr.appendChild(cell);
    // checkbox inputs (ClinASCVD)
    } else if (inptype == "checkbox") {
      input.setAttribute("checked",true);
      cell.setAttribute("style","text-align:center;width:120px;padding-left:30px");
      cell.appendChild(input);
      tr.appendChild(cell);
    // number inputs (Age, LDL-C)
    } else if (inptype == "float") {
      input.setAttribute("value",defaultval);
      input.setAttribute("style","width:45px;text-align:center");
      cell.setAttribute("style", "text-align:right;width:110px");
      cell.appendChild(input);
      tr.appendChild(cell);
      var validation_cell = this.makeElem("td");
      validation_cell.setAttribute("style","text-align:center;width:120px;color:#FF0000;font-size:12");
      var validation = this.makeElem("span");
      validation_cell.appendChild(validation);
      tr.appendChild(validation_cell);
    } else {
      console.log("bad input type!");
      return ;
    }
    
    this.inputs[inpname] = [input, validation];
    table.appendChild(tr);
  }
  
  // function to display results as passed by the make calculator function
  this.showResults = function (div, results) {
    // make elements
    var table = this.makeElem("table");
    var titlerow = this.makeElem("tr");
    var outptrow = this.makeElem("tr");
    var cells = [];
    for (var i in [0, 1, 2, 3]){
      cells.push(this.makeElem("td"));
      cells[i].setAttribute("style", "text-align:center;width:190px;");
    }
    cells[0].appendChild(document.createTextNode("5Y Risk of ASCVD"));
    titlerow.appendChild(cells[0]);
    cells[1].appendChild(document.createTextNode("10Y Risk of ASCVD"));
    titlerow.appendChild(cells[1]);
    table.appendChild(titlerow);
    cells[2].appendChild(document.createTextNode("> " + (Math.floor(results["risk"]*1000.0)/10.0).toString()+'%'));
    outptrow.appendChild(cells[2]);
    cells[3].appendChild(document.createTextNode("> " + (Math.floor(2 * results["risk"]*1000.0)/10.0).toString()+'%'));
    outptrow.appendChild(cells[3]);
    table.appendChild(outptrow);
    
    var risklevel = this.makeElem("p");
    risklevel.appendChild(document.createTextNode("Risk Level: "+ results["risklevel"]));
    
    var NNT = this.makeElem("p");
    NNT.setAttribute("style", "font-size:24");
    NNT.appendChild(document.createTextNode("Five Year NNT: " + results["NNT"].toString()));
    
    // clear and insert
    div.innerHTML = "";
    div.appendChild(table);
    div.appendChild(risklevel);
    div.appendChild(NNT);
    div.appendChild(this.makeElem("hr"));
  }
  
  // building the calculator...
  this.id = div_id;
  this.shell = document.getElementById(this.id);
  this.d = this.makeElem("div");
  this.shell.appendChild(this.d);
  this.d.setAttribute("style", "width:380px;text-align:center;border-style:double;padding-bottom:0px");
  
  // build "title"
  this.title = [];
  this.title.push(this.makeElem('p'));  // title
  this.title.push(this.makeElem("p"));  // subtitle
  this.title.push(this.makeElem("hr")); // separator
  this.title[0].setAttribute("style","font-size:30");
  this.title[0].appendChild(document.createTextNode("NNT Estimator"));
  this.title[1].setAttribute("style","font-size:16;text-align:center;padding-left:40px;padding-right:40px");
  this.title[1].appendChild(document.createTextNode("Number Needed to Treat for LDL-C reducers while on maximal statin therapy"));
  for (var i in this.title) {
    this.d.appendChild(this.title[i]);
  }
  
  // build table of static risk factor inputs
  this.t = [];
  this.t.push(this.makeElem("table"));
  this.t.push(this.makeElem("table"));  // repeat is not an accident
  this.makeInput(this.t[0], "Sex", "ismale", "radio", "Female", "Male");
  this.makeInput(this.t[0], "Clinical ASCVD", "clinASCVD", "checkbox");
  this.makeInput(this.t[1], "Age", "age", "float", 30, 120, 60);
  this.makeInput(this.t[1], "LDL-C (mg/dL)", "LDLC", "float", 60, 400, 170);
  //this.makeInput(this.t[1], "Systolic BP", "sysBP", "float", 90, 350, 120);   // SBP may not be necessary
  for (var i in this.t) {
    this.d.appendChild(this.t[i]);
  }
  
  // build "risk factors"
  this.rf = [];
  this.rf.push(this.makeElem("table"));
  this.rf.push(this.makeElem("table"));
  this.selector = this.makeSelector(this.rf[1]);
  this.rf.push(this.makeElem("hr"));
  for (var i in this.rf) {
    this.d.appendChild(this.rf[i]);
  }
  
  // build "percent ldl-c reduction"
  this.ldl = [];
  this.ldl.push(this.makeElem("p"));          // title
  this.ldl.push(this.makeElem("input"));      // input
  this.ldl.push(this.makeElem("span"));       // validation
  this.ldl[0].setAttribute("style","text-align:center");
  this.ldl[0].appendChild(document.createTextNode("Percent LDL-C Reduction"));
  this.ldl[1].setAttribute("style","width:45px;text-align:center");
  this.ldl[1].setAttribute("type", "float");
  this.ldl[1].setAttribute("name", "percentLDLCreduction");
  this.ldl[1].setAttribute("value", 20);
  this.ldl[2].setAttribute("style", "color:FF0000");
  this.ldl.push(this.makeElem("hr"));
  for (var i in this.ldl) {
    this.d.appendChild(this.ldl[i]);
  }
  this.inputs["percentLDLCreduction"] = [this.ldl[1], this.ldl[2]];
  
  
  // build "results"
  this.r = this.makeElem("div");
  this.showResults(this.r,{'NNT':0,'risk':0,'risklevel':"Unknown"});
  this.d.appendChild(this.r);
  
  // build disclaimer
  this.disclaimer = [];
  this.disclaimer.push(this.makeElem("p"));
  this.disclaimer[0].setAttribute("style", "color:#990000;font-size:12;padding-left:35px;padding-right:35px");
  this.disclaimer[0].appendChild(document.createTextNode("Estimates reflect broad risk categories and may not respond to all value changes"));
  for (var i in this.disclaimer) {
    this.d.appendChild(this.disclaimer[i]);
  } 

  // function addRiskFactor: adds a risk factor to the list shown, remove from the selector list
  this.addRiskFactor = function (useable_key) {
    // take option out of selectorKeys
    for(var i = this.selectorKeys.length -1; i >= 0 ; i--){
      if(this.selectorKeys[i] == useable_key){
        this.selectorKeys.splice(i, 1);
        // put it into riskfactorKeys
        this.riskfactorKeys.push(useable_key);
      }
    }
    //remake both html elements
    this.makeRFlist(this.rf[0]);
    this.selector = this.makeSelector(this.rf[1]);
  }

  //function to remove a risk factor from the list
  this.removeRiskFactor = function(useable_key) {
    if (useable_key == '') {
      // put option back in
    } else if (useable_key == '') {
      // pass?
    } else {
      // take option out of riskfactorKeys
      for(var i = this.riskfactorKeys.length -1; i >= 0 ; i--){
        if(this.riskfactorKeys[i] == useable_key){
            this.riskfactorKeys.splice(i, 1);
            // put the key back into selector keys
          this.selectorKeys.push(useable_key);
        }
      }
      //remake both html elements
      this.makeRFlist(this.rf[0]);
      this.selector = this.makeSelector(this.rf[1]);
    }
    this.formData[useable_key] = 0;
  }

  // onformsubmission runs all necessary actions for when the form is submitted
  this.onformsubmission = function() {
  
    // check for new risk factors
    for (var i in this.selectorKeys) {
      if (this.selector.options[this.selectorKeys[i]].selected){
        useable = this.selectorKeys[i];
        if (useable == 'notadding') {
          // does nothing if the form is not being used
        } else if (useable == 'uncontrolled_ASCVD') {    // riskfactors implying ASCVD
          this.formData['uncontrolled_ASCVD'] = 1;
          this.inputs["clinASCVD"][0].checked = true;
          this.addRiskFactor('uncontrolled_ASCVD');
        } else {                                // usually just sets the formData value to 1 and adds the risk value
          this.formData[this.selectorKeys[i]] = 1;
          this.addRiskFactor(this.selectorKeys[i]);
        }
      }
    }
      
    // reset the selector
    this.selector.options['notadding'].selected = true;
      
    // validate/reset other form data
    // sex
    if (this.inputs["ismale"].checked) {
      formData['ismale'] = 1 ;
    } else this.formData['ismale'] = 0;
    // Clinical ASCVD
    if (this.inputs["clinASCVD"][0].checked) {
      this.formData['clinASCVD'] = 1;
    }
    else {
      this.formData['clinASCVD'] = 0;
      // Remove 'uncontrolled_ASCVD' if ASCVD is removed
      if (this.formData['uncontrolled_ASCVD'] == 1) {
          this.removeRiskFactor('uncontrolled_ASCVD');
          this.formData['uncontrolled_ASCVD'] == 0;
      }
    }
    // percent LDL-C reduction
    if (0.0 <= this.inputs['percentLDLCreduction'][0].value && this.inputs['percentLDLCreduction'][0].value <= 100.0) {
      this.formData['percentLDLCreduction'] = this.inputs['percentLDLCreduction'][0].value / 100.0;
    } else {
      this.inputs["percentLDLCreduction"][0].value = 100*formData['percentLDLCreduction'][0];
      this.inputs["percentLDLCreduction"][1].innerHTML = '0 &le; % LDL-C Reduction &le; 100';
      setTimeout(function(){
        this.inputs["percentLDLCreduction"][1].innerHTML = '';
      }, 3000);
    }
    // age
    if (30 <= this.inputs['age'][0].value && this.inputs['age'][0].value <= 120) { 
      this.formData['age'] = this.inputs['age'][0].value;
    } else {
      this.inputs['age'][0].value = formData['age'];
      this.inputs['age'][1].innerHTML = '30 &le; Age &le; 120';
      setTimeout(function(){
        this.inputs['age'][1].innerHTML = '';
      }, 3000);
    }
    // LDLC
    if (60 <= this.inputs['LDLC'][0].value && this.inputs['LDLC'][0].value <= 400) {
      this.formData['LDLC'] = this.inputs['LDLC'][0].value;
    } else {
      this.inputs['LDLC'][0].value = this.formData['LDLC'];
      this.inputs['LDLC'][1].innerHTML = '60 &le; LDL-C &le; 400';
      setTimeout(function(){
        this.inputs['LDLC'][1].innerHTML = '';
      }, 3000);
    }
    // sysBP here (if in use)
    /*
    if (90 <= this.inputs['sysBP'][0].value && this.inputs['sysBP'][0].value <= 350) { 
        this.formData['sysBP'] = this.inputs['sysBP'][0].value;
    } else {
        form.sysBP.value = formData['sysBP'];
        this.inputs['sysBP'][1].innerHTML = '90 &le; LDL-C &le; 350';
        setTimeout(function(){
            this.inputs['sysBP'][1].innerHTML = '';
        }, 3000);
    }
    */
    
    // calculate
    //{'NNT':0,'risk':0,'risklevel':"Unknown"};
    var output = this.NNTdata(this.formData);
    
    // display output
    this.showResults(this.r,output);  
  }
  
  // simulate form submission
  this.onformsubmission();
  
  // set listeners
  var _this = this;
  for (key in this.inputs) {
    _this.inputs[key][0].addEventListener("change", function(){_this.onformsubmission()});
  }
}
