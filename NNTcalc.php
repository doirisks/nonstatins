<div style="width:380px;text-align:center;border-style:double;padding-bottom:0px">
<style>
.leftcolumncell {
    text-align:right;
    padding-right:10px;
    width:115px
}
.numer_input_cell {
    text-align:right;
    width:110px
}
.sexchoicecell {
    text-align:right;
    width:145px
}
.riskfactorcell {
    text-align:center;
    width:250px
}
.validationcell {
    text-align:center;
    width:120px;
    color:#FF0000;
    font-size:12
}
</style>

<! title>
<p style="font-size:30">NNT Estimator</p>
<! description>
<p style="padding-left:20px;padding-right:20px">Number Needed to Treat for LDL-C reducers</p>
<hr>
<form id = 'inputs'>
<table>
    <tr>
        <td class='leftcolumncell'>Sex:</td>
        <td class = 'sexchoicecell'>
            <input type="radio" name="ismale" value="male" checked>Male
            <input type="radio" name="ismale" value="female">Female
        </td> 
    </tr>
</table>
<table>
        <td class='leftcolumncell'>Age:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'age' /> </td>
        <td class = 'validationcell'><span id = 'age_validation'></span></td>
    </tr>
    <tr>
        <td class='leftcolumncell'>LDL-C:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'LDLC' /> </td>
        <td class = 'validationcell'><span id = 'LDLC_validation'></span></td>
    </tr>
    <tr>
        <td class='leftcolumncell'>Systolic BP:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'sysBP' /></td>
        <td class = 'validationcell'><span id = 'sysBP_validation'></span></td>
    </tr>
</table>
<table id = 'rflist' name = 'rflist'>
</table>
<table id = 'selectorlist'>
</table>
<hr>
<span style='text-align:center'>
    <p> Percent LDL-C Reduction</p>
    <input type = 'float' style="width:45px;text-align:center" name = 'percentLDLCreduction' />
    <p style="color:FF0000"><span id = 'percent_validation'></span></p>
</span>
</form>
<hr>
<div> 
<p>Risk: <span id = "risk" ></span></p>
<p>Risk Level: <span id = "risklevel" ></span></p>
<p>NNT: <span id = "NNT" ></span></p>
<hr>
<p style="color:#990000;font-size:12;padding-left:35px;padding-right:35px">Estimates reflect broad risk categories and may not respond to all value changes.</p>
</div>
<script type="text/javascript" src="calculate.js"></script>
<script type="text/javascript">

// preliminary settings
var form = document.getElementById('inputs');
form.age.value = 60;
form.LDLC.value = 170;
form.sysBP.value = 120;
form.percentLDLCreduction.value = 20;
//form.clinASCVD.checked = true;
//form.ismale[0].checked
//alert(form.s1.options['clinASCVD'].selected);
//alert(form['s1'].options['clinASCVD'].selected);


// default values
var formData = {'ismale' : 0, 'clinASCVD': 0, 'metabSyndrome': 0,'diabetic': 0,'antihyp': 0,'coronHeartDis': 0,'CVC': 0,'arterDisease': 0,'histStroke': 0,'ACShist': 0,'CKD': 0};

// arrays of names
var formDataKeys = ['ismale','clinASCVD', 'metabSyndrome','diabetic','antihyp','coronHeartDis','CVC', 'arterDisease','histStroke','ACShist','CKD']; // keys that should start at value of zero
var riskfactorKeys = [];
var selectorKeys = ['notadding','clinASCVD', 'metabSyndrome','diabetic','coronHeartDis','CVC', 'arterDisease','ACShist','CKD','histStroke1','histStroke2','antihyp<4','antihyp4+']; // useable keys
var selectorNames = {'notadding':'---','clinASCVD':'Clinical ASCVD','diabetic':'Diabetes','antihyp<4':'Antihypertensives (up to 4)','antihyp4+':'Antihypertensives (4 or more)','coronHeartDis':'Coronary Heart Disease','CVC':'CVC', 'arterDisease':'Arterial Disease','CKD':'Chronic Kidney Disease','ACShist':'History of Acute Coronary Syndrome','histStroke1':'History of Transient Ischemic Attack','histStroke2':'History of Stroke', 'metabSyndrome':'Metabolic Syndrome'}; // maps useable to readable keys

// making the selector
var selector_beg = "<tbody><tr><td class='leftcolumncell'>Add Risk Factor:</td><td class = 'riskfactorcell'><select name = 'rf_selector'>";
var selector_end = "</select></td></tr></tbody>";
function makeSelector() {
    selectorText = selector_beg;
    for (var key in selectorKeys) {
        selectorText += "<option name = '" + selectorKeys[key] + "'>" + selectorNames[selectorKeys[key]] + "</option>";
    }
    selectorText += selector_end;
    document.getElementById('selectorlist').innerHTML = selectorText;
}
makeSelector();

// making the risk factor list
var rflist_beg = "";
var rflist_end = "";
function makeRFlist() {
    rfText = rflist_beg;
    for (var key in riskfactorKeys) {     
        rfText += "<tr name = '"+ riskfactorKeys[key] +"' class = 'rfli'><td class = 'leftcolumncell'><input type = 'button' name = '" + riskfactorKeys[key] + "' value = 'Remove' onclick = 'rfremovalbuttonclicked(&#39" + riskfactorKeys[key] +"&#39)'></td><td class = 'riskfactorcell'>" + selectorNames[riskfactorKeys[key]] + "</td></tr>";
    }
    rfText += rflist_end;
    document.getElementById('rflist').innerHTML = rfText;
}

function rfremovalbuttonclicked(useable_key){
    removeRiskFactor(useable_key);
    onformsubmission();
}

// function to add a risk factor to the list
function addRiskFactor(useable_key) {
    // take option out of selectorKeys
    for(var i = selectorKeys.length -1; i >= 0 ; i--){
        if(selectorKeys[i] == useable_key){
            selectorKeys.splice(i, 1);
            // put it into riskfactorKeys
            riskfactorKeys.push(useable_key);
        }
    }
    //remake both html elements
    makeRFlist();
    makeSelector();
}

//function to remove a risk factor from the list
function removeRiskFactor(useable_key) {
    if (useable_key == '') {
        // put option back in
    } else if (useable_key == '') {
    
    } else {
        // take option out of riskfactorKeys
        for(var i = riskfactorKeys.length -1; i >= 0 ; i--){
            if(riskfactorKeys[i] == useable_key){
                riskfactorKeys.splice(i, 1);
                // put the key back into selector keys
                selectorKeys.push(useable_key);
            }
        }
        //remake both html elements
        makeRFlist();
        makeSelector();
    }
    if (useable_key == 'antihyp<4' || useable_key == 'antihyp4+') {
        formData['antihyp'] = 0;
    } else if (useable_key == 'histStroke1' || useable_key == 'histStroke2') { 
        formData['histStroke'] = 0;
        for(var i = riskfactorKeys.length -1; i >= 0 ; i--){
            if(riskfactorKeys[i] == 'histStroke1' || riskfactorKeys[i] == 'histStroke2'){
                formData['histStroke'] = 1;
            } 
        }
    } else {
       formData[useable_key] = 0;
   }
}

// function for when the form is submitted
function onformsubmission() {

    // check for new risk factors
    for (var key in selectorKeys) {
        if (form['rf_selector'].options[selectorKeys[key]].selected){
            useable = selectorKeys[key];
            if (useable == 'notadding') {           // does nothing if the form is not being used
            } else if (useable == 'histStroke1') {  // handles interchangeable kinds of history
                formData['histStroke'] = 1;
                addRiskFactor('histStroke1');
            } else if (useable == 'histStroke2') {  // handles interchangeable kinds of history
                formData['histStroke'] = 1;
                addRiskFactor('histStroke2');
            } else if (useable == 'antihyp<4') {    // handles antihypertensives up to 4
                removeRiskFactor('antihyp4+');
                formData['antihyp'] = 1;
                addRiskFactor('antihyp<4');
            } else if (useable == 'antihyp4+') {    // handles antihypertensives greater than 4
                removeRiskFactor('antihyp<4');
                formData['antihyp'] = 4;
                addRiskFactor('antihyp4+');
            } else {                                // usually just sets the formData value to 1 and adds the risk value
                formData[selectorKeys[key]] = 1;
                addRiskFactor(selectorKeys[key]);
            }
        }
    }
    
    // reset the selector
    form['rf_selector'].options['notadding'].selected = true;
    
    // check/validate/reset other form data
    if (form.ismale[0].checked) formData['ismale'] = 1 ;
    else formData['ismale'] = 0;
    if (0.0 <= form['percentLDLCreduction'].value && form['percentLDLCreduction'].value <= 100.0) {     // percent LDL-C reduction
        formData['percentLDLCreduction'] = form['percentLDLCreduction'].value / 100.0;
    } else {
        form.percentLDLCreduction.value = 100*formData['percentLDLCreduction'];
        document.getElementById('percent_validation').innerHTML = '0 &le; % LDL-C Reduction &le; 100';
        setTimeout(function(){
            document.getElementById('percent_validation').innerHTML = '';
        }, 3000);
    }
    if (30 <= form['age'].value && form['age'].value <= 120) {                                          // age
        formData['age'] = form['age'].value;
    } else {
        form.age.value = formData['age'];
        document.getElementById('age_validation').innerHTML = '30 &le; Age &le; 120';
        setTimeout(function(){
            document.getElementById('age_validation').innerHTML = '';
        }, 3000);
    }
    if (160 <= form['LDLC'].value && form['LDLC'].value <= 400) {                                          // LDLC
        formData['LDLC'] = form['LDLC'].value;
    } else {
        form.LDLC.value = formData['LDLC'];
        document.getElementById('LDLC_validation').innerHTML = '160 &le; LDL-C &le; 400';
        setTimeout(function(){
            document.getElementById('LDLC_validation').innerHTML = '';
        }, 3000);
    }
    if (100 <= form['sysBP'].value && form['sysBP'].value <= 200) {                                          // sysBP
        formData['sysBP'] = form['sysBP'].value;
    } else {
        form.sysBP.value = formData['sysBP'];
        document.getElementById('sysBP_validation').innerHTML = '100 &le; LDL-C &le; 200';
        setTimeout(function(){
            document.getElementById('sysBP_validation').innerHTML = '';
        }, 3000);
    }
    
    // calculate
    output = getOutput(formData);
    
    // gets the keys of output
    var keys = ['NNT','risk','risklevel'];
    for (var i = 0; i < keys.length;i++) {
        if (i == 1) {
            document.getElementById(keys[i]).innerHTML = "&gt;" + (Math.floor(output[keys[i]]*1000.0)/10.0).toString()+'%';
        }
        else {
            document.getElementById(keys[i]).innerHTML = output[keys[i]];
        }
    }
}
onformsubmission();

// tells the thing what to do!
form.addEventListener("change", onformsubmission);
</script>
<div>
