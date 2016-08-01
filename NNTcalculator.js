 /**
  * calculate.js
  * by Ted Morin
  * 
  * contains a function to turn a div into a the NNT calculator for nonstatins paper
  * expects:
  * 1) div id will be passed as argument
  * 2) function will be stored in variable with the SAME NAME as div id
  **/
  
  // TODO add support for older IE in dynamic build of Sex input
  // TODO change the 5 and 10 year risk displays to show "greater than or equal to" ( >= ) instead of ">"

function NNTcalculator(div_id) {
  
  // "global" variables
  this.inputs = [];  // inputs to check 
  this.formData = {'ismale' : 0, 'clinASCVD': 0, 'metabSyndrome': 0,'diabetic': 0,'antihyp': 0,'coronHeartDis': 0,'CVC': 0,'arterDisease': 0,'histStroke': 0,'ACShist': 0,'CKD': 0};
  this.formDataKeys = ['clinASCVD', 'diabetic','recentACS','uncontrolled_ASCVD','fam_hypercholesterolemia']; // keys that should start at value of zero
  this.riskfactorKeys = [];
  this.selectorKeys = [
      'notadding', 
      'diabetic',
      'recentACS',
      'uncontrolled_ASCVD',
      'fam_hypercholesterolemia',
      'CKD'
  ]; // useable keys
  this.selectorNames = {
      'notadding':'---',
      'diabetic':'Diabetes',
      'recentACS' : 'Recent ACS (<3 months)',
      'uncontrolled_ASCVD': 'Poorly Controlled ASCVD Risk Factors',
      'fam_hypercholesterolemia': 'Familial Hypercholesterolemia',
      'CKD' : 'Chronic Kidney Disease'
  }; // maps useable to readable keys
  
  // function makeSelector: makes the risk factor selector
  this.makeSelector = function(master, table) {
    var selector = master.makeElem("select");
    for (i in master.selectorKeys) {
      var opt = master.makeElem("option");
      opt.setAttribute("name",master.selectorKeys[i]);
      opt.appendChild(document.createTextNode(master.selectorNames[master.selectorKeys[i]]));
      selector.appendChild(opt);
    }
    
    var label = master.makeElem("td");
    label.setAttribute("style","font-size:15;text-align:right;padding-right:10px;width:115px");
    label.appendChild(document.createTextNode("Add Risk Factor:"));
    var selector_cell = master.makeElem("td");
    selector_cell.setAttribute("style", "text-align:center;width:250px");
    selector_cell.appendChild(selector);
    var tr = master.makeElem("tr");
    tr.appendChild(label);
    tr.appendChild(selector_cell);
    //var tbody = master.makeElem("tbody");
    //tbody.appendChild(tr);
    table.appendChild(tr);//body);
  } 
  
  // function makeElem: returns document.createElement(), but adds class NNTcalculator to the tag name
  this.makeElem = function (tagname) {
    var newElem = document.createElement(tagname)
    newElem.setAttribute("class", "NNTcalculator");
    return newElem;
  }
  
  // function make input: returns an input table row
  this.makeInput = function(master, table, title, inpname, inptype, lower, upper, defaultval) {
  
    var tr = master.makeElem("tr");
    var titlecell = master.makeElem("td");  // title of the input
    titlecell.appendChild(document.createTextNode(title + ":"));
    titlecell.setAttribute("style","font-size:15;text-align:right;padding-right:10px;width:115px");
    tr.appendChild(titlecell);
    var cell = master.makeElem("td");
    var input = master.makeElem("input")
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
      var input2 = master.makeElem("input");
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
      var validation_cell = master.makeElem("td");
      validation_cell.setAttribute("style","text-align:center;width:120px;color:#FF0000;font-size:12");
      var validation = master.makeElem("span");
      validation_cell.appendChild(validation);
      tr.appendChild(validation_cell);
    } else {
      console.log("bad input type!");
      return ;
    }
    
    master.inputs.push([inpname, input, validation]);
    table.appendChild(tr);
  }
  
  // function to display results as passed by the make calculator function
  this.showResults = function (master, div, results) {
    // make elements
    var table = master.makeElem("table");
    var titlerow = master.makeElem("tr");
    var outptrow = master.makeElem("tr");
    var cells = [];
    for (i in [0, 1, 2, 3]){
      cells.push(master.makeElem("td"));
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
    
    var risklevel = master.makeElem("p");
    risklevel.appendChild(document.createTextNode("Risk Level: "+ results["risklevel"]));
    
    var NNT = master.makeElem("p");
    NNT.setAttribute("style", "font-size:24");
    NNT.appendChild(document.createTextNode("Five Year NNT: " + results["NNT"].toString()));
    
    // clear and insert
    div.innerHTML = "";
    div.appendChild(table);
    div.appendChild(risklevel);
    div.appendChild(NNT);
    div.appendChild(master.makeElem("hr"));
  }
  
  // building the calculator...
  this.id = div_id;
  this.d = document.getElementById(this.id);
  this.d.setAttribute("style", "width:380px;text-align:center;border-style:double;padding-bottom:0px");
  
  // build "title"
  this.title = [];
  this.title.push(this.makeElem('p'));  // title
  this.title.push(this.makeElem("p"));  // subtitle
  this.title.push(this.makeElem("hr")); // separator
  this.title[0].setAttribute("style","font-size:30");
  this.title[0].appendChild(document.createTextNode("NNT Estimator"));
  this.title[1].setAttribute("style","font-size:16");
  this.title[1].appendChild(document.createTextNode("Number Needed to Treat for LDL-C reducers"));
  for (i in this.title) {
    this.d.appendChild(this.title[i]);
  }
  
  // build table of static risk factor inputs
  this.t = [];
  this.t.push(this.makeElem("table"));
  this.t.push(this.makeElem("table"));  // repeat is not an accident
  this.makeInput(this, this.t[0], "Sex", "ismale", "radio", "Female", "Male");
  this.makeInput(this, this.t[0], "Clinical ASCVD", "clinASCVD", "checkbox");
  this.makeInput(this, this.t[1], "Age", "age", "float", 30, 120, 60);
  this.makeInput(this, this.t[1], "LDL-C (mg/dL)", "LDLC", "float", 60, 400, 170);
  this.makeInput(this, this.t[1], "Systolic BP", "sysBP", "float", 90, 350, 120);
  for (i in this.t) {
    this.d.appendChild(this.t[i]);
  }
  
  // build "risk factors"
  this.rf = [];
  this.rf.push(this.makeElem("table"));
  this.rf.push(this.makeElem("table"));
  this.makeSelector(this, this.rf[1]);
  this.rf.push(this.makeElem("hr"));
  for (i in this.rf) {
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
  for (i in this.ldl) {
    this.d.appendChild(this.ldl[i]);
  }
  this.inputs.push(["percentLDLCreduction", this.ldl[1], this.ldl[2]);
  
  
  // build "results"
  this.r = this.makeElem("div");
  this.showResults(this, this.r,{'NNT':0,'risk':0,'risklevel':"Unknown"});
  this.d.appendChild(this.r);
  
  // build disclaimer
  this.disclaimer = [];
  this.disclaimer.push(this.makeElem("p"));
  this.disclaimer[0].setAttribute("style", "color:#990000;font-size:12;padding-left:35px;padding-right:35px");
  this.disclaimer[0].appendChild(document.createTextNode("Estimates reflect broad risk categories and may not respond to all value changes"));
  for (i in this.disclaimer) {
    this.d.appendChild(this.disclaimer[i]);
  } 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}
