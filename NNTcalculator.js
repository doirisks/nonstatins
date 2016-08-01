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

function NNTcalculator(div_id) {
  
  // "global" variables
  this.inputs = [];  // inputs to check 
  
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
      var validation = master.makeElem("td");
      validation.setAttribute("style","text-align:center;width:120px;color:#FF0000;font-size:12");
      var validation_text = master.makeElem("span");
      validation.appendChild(validation_text);
      tr.appendChild(validation);
    } else {
      console.log("bad input type!");
      return ;
    }
    
    master.inputs.push(input);
    table.appendChild(tr);
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
  
  // buidl "risk factors"
  this.rf = this.makeElem("table");
  this.d.appendChild(this.rf);
  
  // build "percent ldl-c reduction"
  this.ldl = [];
  this.ldl.push(this.makeElem("hr"));
  for (i in this.ldl) {
    this.d.appendChild(this.ldl[i]);
  }
  
  
  // build results
  this.r = [];
  this.r.push(this.makeElem("table")); // 5Y and 10Y Risks
  this.r.push(this.makeElem("p"));     // Risk Level
  this.r.push(this.makeElem("p"));     // Five Year NNT
  this.ldl.push(this.makeElem("hr"));  // separator
  
  for (i in this.r) {
    this.d.appendChild(this.r[i]);
  }
  
  // build disclaimer
  this.disclaimer = [];
  this.disclaimer.push(this.makeElem("p"));
  this.disclaimer[0].setAttribute("style", "color:#990000;font-size:12;padding-left:35px;padding-right:35px");
  this.disclaimer[0].appendChild(document.createTextNode("Estimates reflect broad risk categories and may not respond to all value changes"));
  for (i in this.disclaimer) {
    this.d.appendChild(this.disclaimer[i]);
  }
  
}
