 /**
  * calculate.js
  * by Ted Morin
  * 
  * contains a function to turn a div into a the NNT calculator for nonstatins paper
  * expects div id passed as an argument
  *
  * to add support for a new risk factor, make appropriate edits in:
  * formData
  * selectorKeys
  * selectorNames
  * NNTdata (function)
  * 
  * if the new risk factor implies ASCVD, also edit onformsubmission near comments:
  * "riskfactors implying ASCVD"
  * "Remove impossible risk factors"
  * 
  **/
  
  // TODO add support for older IE in dynamic build of Sex input
  // TODO change the 5 and 10 year risk displays to show "greater than or equal to" ( >= ) instead of ">"
  // TODO make it so that add or removing a risk factor does not require rebuilding the whole lists!

function NNTcalculator(div_id) {
  
  // "global" variables
  this.inputs = {};     // inputs to check 
  this.formData = {  // initial values
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
    'CKD': 0,
    'multEvents' : 0,
    'elevLipo' : 0,
    'fam_hypercholesterolemia': 0
  };
  this.riskfactorKeys = [];       // keys for selected risk factors
  this.riskfactorTableRows = [];  // risk factor table rows
  this.selectorKeys = [ // useable keys
      'notadding', 
      'diabetic',
      'recentACS',
      'uncontrolled_ASCVD',
      'fam_hypercholesterolemia',
      'multEvents',
      'elevLipo',
      'CKD'
  ]; 
  this.selectorNames = { // maps useable keys to names
      'notadding':'---',
      'diabetic':'Diabetes',
      'recentACS' : 'Recent ACS (<3 months)',
      'uncontrolled_ASCVD': 'Poorly Controlled ASCVD Risk Factors',
      'fam_hypercholesterolemia': 'Familial Hypercholesterolemia',
      'multEvents' : 'Multiple Recurrent Events',
      'elevLipo' : 'Elevated Lipoprotein (a)',
      'CKD' : 'Chronic Kidney Disease'
  }; 
  this.default_styles = { // essentially the css file of this javascript
    "div" : {
      "margin": "0px 0px 0px 0px",
      "font-family":'"Times New Roman", Times, serif',
      "display":"block",
    },
    "table" : {
      "margin": "0px 0px 0px 0px",
      "white-space": "normal",
      "line-height": "normal",
      "font-weight": "normal",
      "font-size": "medium",
      "font-style": "normal",
      "color": "-internal-quirk-inherit",
      "text-align": "start",
      "font-variant": "normal",
      "font-variant-ligatures": "normal",
      "font-variant-caps": "normal",
      "display": "table",
      "border-collapse": "separate",
      "border-spacing": "2px",
      "-webkit-border-horizontal-spacing": "2px",
      "-webkit-border-vertical-spacing": "2px",
      "border-color": "grey",
      "border-top-color": "grey",
      "border-right-color": "grey",
      "border-bottom-color": "grey",
      "border-left-color": "grey"
    },
    "tr" : {
      "margin": "0px 0px 0px 0px",
      "display": "table-row",
      "vertical-align": "inherit",
      "border-color": "inherit"
    },
    "td" : {
      "display": "table-cell",
      "vertical-align": "inherit"
    },
    "p" : {
      "margin": "0px 0px 0px 0px",
      "font-family":'"Times New Roman", Times, serif',
      "display": "block",
      //"-webkit-margin-before": "1em",
      //"-webkit-margin-after": "1em",
      //"-webkit-margin-start": "0px",
      //"-webkit-margin-end": "0px"
    },
    "select": {
      "-webkit-appearance": "menulist",
      "box-sizing": "border-box",
      "align-items": "center",
      "border-image-source": "initial",
      "border-image-slice": "initial",
      "border-image-width": "initial",
      "border-image-outset": "initial",
      "border-image-repeat": "initial",
      "white-space": "pre",
      "-webkit-rtl-ordering": "logical",
      "color": "black",
      //"background-color": "white",
      "cursor": "default",
      "border-width": "1px",
      "border-style": "solid",
      //"border-color": "initial",
      
      "text-rendering": "auto",
      "letter-spacing": "normal",
      "word-spacing": "normal",
      "text-transform": "none",
      "text-indent": "0px",
      "text-shadow": "none",
      "display": "inline-block",
      "text-align": "start",
      "margin": "0px 0px 0px 0px",
      "font": "13.3333px Arial;\n!important"
    },
    "option": {
      "font-weight": "normal",
      "display": "block",
      "white-space": "pre",
      "min-height": "1.2em",
      "padding": "0px 2px 1px",
    }
  }
  
  
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
      if (  // with comorbidities
          (data['diabetic']) || 
          (data['recentACS']) || 
          (data['uncontrolled_ASCVD']) || 
          (data['CKD']) || (data['LDLC'] >= 190) || 
          (data['fam_hypercholesterolemia']) ||
          (data['multEvents']) ||
          (data['elevLipo'])
        ) {
        leastrisk = 0.15; 
      } else {// without comorbidities
        leastrisk = 0.10; 
      }
    } else if ((data['fam_hypercholesterolemia']) || (data['LDLC'] >= 190)) {
      leastrisk = 0.10; // certain comorbidities alone
    } else if (false == true) {
      leastrisk = 0.05;
    } else {
      return {'NNT': 0,'risk': 0 ,'risklevel': "UNKNOWN" };  
    }
    return this.NNTcalculation(leastrisk, data['LDLC'], data['percentLDLCreduction']);
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
    var selector = this.makeElem("select", null);
    for (var i in this.selectorKeys) {
      var opt = this.makeElem("option", null);
      opt.setAttribute("name",this.selectorKeys[i]);
      opt.appendChild(document.createTextNode(this.selectorNames[this.selectorKeys[i]]));
      selector.appendChild(opt);
    }
    var _this = this;
    selector.addEventListener("change", function(){_this.onformsubmission()});
    
    var label = this.makeElem("td",{
      "font-size":"15px",
      "text-align":"right",
      "padding-right":"10px",
      "width":"115px"
    });
    label.appendChild(document.createTextNode("Add Risk Factor:"));
    var selector_cell = this.makeElem("td",{"text-align":"center","width":"250px"});
    selector_cell.appendChild(selector);
    var tr = this.makeElem("tr", null);
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
      var remove = this.makeElem("button", null);
      remove.appendChild(document.createTextNode("Remove"));
      remove["name"] = this.riskfactorKeys[i];
      var _this = this;
      remove.addEventListener("click", function() {
        _this.removeRiskFactor(this["name"]);
        _this.onformsubmission();  
      });
      var remove_cell = this.makeElem("td",{
        "font-size":"15px",
        "text-align":"right",
        "padding-right":"10px",
        "width":"115px"
      });
      remove_cell.appendChild(remove);
      // display risk factor name
      var display_cell = this.makeElem("td", {
        "text-align":"center",
        "width":"250px"
      });
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
  
  
  // function makeElem: returns document.createElement(), but adds class and styles
  this.makeElem = function (tagname, styles) {
    var newElem = document.createElement(tagname)
    newElem.setAttribute("class", "NNTcalculator");
    var default_styles = this.default_styles[newElem.tagName.toLowerCase()];
    if (styles == null) {
      var styles = default_styles;
    }
    else {
      for (style in default_styles) {
        if (styles[style] == null) {
          styles[style] = this.default_styles[style];
        }
      }
    }
    // write style string
    var stylestring = "";
    for (style in styles) {
      stylestring += style + ":" + styles[style] + ";";
    }
    newElem.setAttribute("style", stylestring);
    return newElem;
  }
  
  // function make input: returns an input table row
  this.makeInput = function(table, title, inpname, inptype, lower, upper, defaultval) {
  
    var tr = this.makeElem("tr");
    var titlecell = this.makeElem("td", {
      "font-size":"15px",
      "text-align":"right",
      "padding-right":"10px",
      "width":"115px"
    });  // title of the input
    titlecell.appendChild(document.createTextNode(title + ":"));
    
    tr.appendChild(titlecell);
    var input = this.makeElem("input",null);
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
      var cell = this.makeElem("td",{
        "text-align":"center",
        "width":"180px"
      });
      cell.appendChild(input);
      cell.appendChild(document.createTextNode(" " + upper + " "));
      cell.appendChild(input2);
      cell.appendChild(document.createTextNode(" " +lower));
      tr.appendChild(cell);
      tr.appendChild(this.makeElem('td',{ // empty filler cell
        "width": "50px"
      }));
    // checkbox inputs (ClinASCVD)
    } else if (inptype == "checkbox") {
      input.setAttribute("checked",true);
      var cell = this.makeElem("td",{
        "text-align":"center",
        "width":"180px",
      });
      cell.appendChild(input);
      tr.appendChild(cell);
      tr.appendChild(this.makeElem('td',{ // empty filler cell
        "width": "50px"
      }));
    // number inputs (Age, LDL-C)
    } else if (inptype == "float") {
      input.setAttribute("value",defaultval);
      input.setAttribute("style","width:45px;text-align:center");
      var cell = this.makeElem("td",{
        "text-align":"right",
        "width":"110px"
      });
      cell.appendChild(input);
      tr.appendChild(cell);
      var validation_cell = this.makeElem("td", {
        "text-align":"center",
        "width":"120px",
        "color":"#FF0000",
        "font-size":"12px"
      });
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
    if (results['risklevel'] == "UNKNOWN") {
      // apologize
      var apology = [];
      apology.push(this.makeElem("p",{"font-size":"18px"}));
      apology[0].appendChild(document.createTextNode("Estimate is not supported for this patient group."));
      if ( // by special request
          (this.formData["clinASCVD"] == 0) &&
          (this.formData["fam_hypercholesterolemia"] == 0) &&
          (this.formData["LDLC"] < 190)
        ) 
      {
        apology.push(this.makeElem("p", {"font-size":"16px"}));
        apology[1].appendChild(document.createTextNode("Awaiting estimates of primary prevention risk on statins."));
      }
        
      
      // clear and insert
      div.innerHTML = "";
      for (var i in apology) {
        div.appendChild(apology[i]);
      }
      div.appendChild(this.makeElem("hr", null));
    }
    else {  // good proper result was returned
      // make elements
      var table = this.makeElem("table", null);
      var titlerow = this.makeElem("tr", null);
      var outptrow = this.makeElem("tr", null);
      var cells = [];
      for (var i in [0, 1, 2, 3]){
        cells.push(this.makeElem("td", {"text-align":"center","width":"190px"}));
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
      
      var risklevel = this.makeElem("p", null);
      risklevel.appendChild(document.createTextNode("Risk Level: "+ results["risklevel"]));
      
      var NNT = this.makeElem("p", {"font-size":"24px"});
      NNT.appendChild(document.createTextNode("Five Year NNT: " + results["NNT"].toString()));
      
      // clear and insert
      div.innerHTML = "";
      div.appendChild(table);
      div.appendChild(risklevel);
      div.appendChild(NNT);
      div.appendChild(this.makeElem("hr",null));
    }
  }
  
  // building the calculator...
  this.id = div_id;
  this.shell = document.getElementById(this.id);
  this.d = this.makeElem("div", {
    "width":"380px",
    "text-align":"center",
    "border-color":"black",
    "border-width":"3px",
    "border-style":"double",
    "padding-bottom":"0px"
  });
  this.shell.appendChild(this.d);
  
  // build "title"
  this.title = [];
  this.title.push(this.makeElem('p', {"font-size":"30px"}));  // title
  this.title.push(this.makeElem("p", {
    "font-size":"16px",
    "text-align":"center",
    "padding-left":"40px",
    "padding-right":"40px"
  }));  // subtitle
  this.title.push(this.makeElem("hr", null)); // separator
  this.title[0].appendChild(document.createTextNode("NNT Estimator"));
  this.title[1].appendChild(document.createTextNode("Number Needed to Treat for LDL-C reducers while on maximal statin therapy"));
  for (var i in this.title) {
    this.d.appendChild(this.title[i]);
  }
  
  // build table of static risk factor inputs
  this.t = [];
  this.t.push(this.makeElem("table", null));
  this.t.push(this.makeElem("table", null));  // repeat is not an accident
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
  this.rf.push(this.makeElem("table", null));
  this.rf.push(this.makeElem("table", null));
  this.selector = this.makeSelector(this.rf[1]);
  this.rf.push(this.makeElem("hr"));
  for (var i in this.rf) {
    this.d.appendChild(this.rf[i]);
  }
  
  // build "percent ldl-c reduction"
  this.ldl = [];
  this.ldl.push(this.makeElem("p", {"text-align":"center"}));          // title
  this.ldl.push(this.makeElem("input", {"width":"45px","text-align":"center"}));      // input
  this.ldl.push(this.makeElem("p", {"color":"FF0000"}));          // validation
  this.ldl[0].appendChild(document.createTextNode("Percent LDL-C Reduction"));
  this.ldl[1].setAttribute("type", "float");
  this.ldl[1].setAttribute("name", "percentLDLCreduction");
  this.ldl[1].setAttribute("value", 20);
  this.ldl.push(this.makeElem("hr", null));
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
  this.disclaimer.push(this.makeElem("p", {
    "color":"#990000",
    "font-size":"12px",
    "padding-left":"35px",
    "padding-right":"35px"
  }));
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

  // function removeRiskFactor: removes a risk factor from the list
  this.removeRiskFactor = function(useable_key) {
    if (useable_key == '') {
      // put option back in
    } else if (useable_key == '') {
      // pass?
    } else {
      // take option out of riskfactorKeys
      var newlist = [];
      for (var i in this.riskfactorKeys) {
        if (this.riskfactorKeys[i] == useable_key){
          this.selectorKeys.push(useable_key);
        } else {
          newlist.push(this.riskfactorKeys[i]);
        }
      }
      this.riskfactorKeys = newlist;
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
        } else if (   // riskfactors implying ASCVD
            (useable == 'uncontrolled_ASCVD') || 
            (useable == 'multEvents') ||
            (useable == 'recentACS')
          ) {    
          this.formData[useable] = 1;
          this.inputs["clinASCVD"][0].checked = true;
          this.addRiskFactor(useable);
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
      this.formData['clinASCVD'] = 0; // Remove impossible risk factors
      // Remove 'recentACS' if ASCVD is removed
      if (this.formData['recentACS'] == 1) {
        this.removeRiskFactor('recentACS');
        this.formData['recentACS'] == 0;
      }
      // Remove 'uncontrolled_ASCVD' if ASCVD is removed
      if (this.formData['uncontrolled_ASCVD'] == 1) {
        this.removeRiskFactor('uncontrolled_ASCVD');
        this.formData['uncontrolled_ASCVD'] == 0;
      }
      // Remove 'multEvents' if ASCVD is removed
      if (this.formData['multEvents'] == 1) {
        this.removeRiskFactor('multEvents');
        this.formData['multEvents'] == 0;
      }
    }
    // percent LDL-C reduction
    if (0.0 <= this.inputs['percentLDLCreduction'][0].value && this.inputs['percentLDLCreduction'][0].value <= 100.0) {
      this.formData['percentLDLCreduction'] = this.inputs['percentLDLCreduction'][0].value / 100.0;
    } else {
      this.inputs["percentLDLCreduction"][0].value = 100*this.formData['percentLDLCreduction'];
      this.inputs["percentLDLCreduction"][1].innerHTML = '0 &le; % LDL-C Reduction &le; 100';
      var _this = this;
      setTimeout(function(){
        _this.inputs["percentLDLCreduction"][1].innerHTML = '';
      }, 3000);
    }
    // age
    if (30 <= this.inputs['age'][0].value && this.inputs['age'][0].value <= 120) { 
      this.formData['age'] = this.inputs['age'][0].value;
    } else {
      this.inputs['age'][0].value = this.formData['age'];
      this.inputs['age'][1].innerHTML = '30 &le; Age &le; 120';
      var _this = this;
      setTimeout(function(){
        _this.inputs['age'][1].innerHTML = '';
      }, 3000);
    }
    // LDLC
    if (60 <= this.inputs['LDLC'][0].value && this.inputs['LDLC'][0].value <= 400) {
      this.formData['LDLC'] = this.inputs['LDLC'][0].value;
    } else {
      this.inputs['LDLC'][0].value = this.formData['LDLC'];
      this.inputs['LDLC'][1].innerHTML = '60 &le; LDL-C &le; 400';
      var _this = this;
      setTimeout(function(){
        _this.inputs['LDLC'][1].innerHTML = '';
      }, 3000);
    }
    // sysBP here (if in use)
    /*
    if (90 <= this.inputs['sysBP'][0].value && this.inputs['sysBP'][0].value <= 350) { 
      this.formData['sysBP'] = this.inputs['sysBP'][0].value;
    } else {
      form.sysBP.value = this.formData['sysBP'];
      this.inputs['sysBP'][1].innerHTML = '90 &le; LDL-C &le; 350';
      var _this = this;
      setTimeout(function(){
        _this.inputs['sysBP'][1].innerHTML = '';
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
