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
.clinascvdcell {
    text-align:center;
    width:120px;
    padding-left:30px
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
.riskdisplaycell {
    text-align:center;
    width:190px;
}
</style>

<! title>
<p style="font-size:30">NNT Estimator</p>
<! description>
<p style="padding-left:20px;padding-right:20px">Number Needed to Treat for LDL-C reducers</p>
<hr>
<form id = 'inputs'>
<table>
<?php if ($_GET['from'] != "table") { ?>
    <tr>
        <td class='leftcolumncell'>Sex:</td>
        <td class = 'sexchoicecell'>
            <input type="radio" name="ismale" value="male" checked>Male
            <input type="radio" name="ismale" value="female">Female
        </td> 
    </tr>
<?php } ?>
    <tr>
        <td class='leftcolumncell'>Clinical ASCVD:</td>
        <td class = 'clinascvdcell'>
            <input type="checkbox" name="clinASCVD" checked>
        </td> 
    </tr>
</table>
<table>
<?php if ($_GET['from'] != "table") { ?>
        <td class='leftcolumncell'>Age:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'age' /> </td>
        <td class = 'validationcell'><span id = 'age_validation'></span></td>
    </tr>
<?php } ?>
    <tr>
        <td class='leftcolumncell'>LDL-C <span style="font-size:13">(mg/dL)</span>:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'LDLC' /> </td>
        <td class = 'validationcell'><span id = 'LDLC_validation'></span></td>
    </tr>
<?php if ($_GET['from'] != "table") { ?>
    <tr>
        <td class='leftcolumncell'>Systolic BP:</td>
        <td class = 'numer_input_cell'><input type = 'float' style="width:45px;text-align:center" name = 'sysBP' /></td>
        <td class = 'validationcell'><span id = 'sysBP_validation'></span></td>
    </tr>
<?php } ?>
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
<table >
    <tr>
        <td class="riskdisplaycell">5Y Risk of ASCVD (est.)</td>
        <td class="riskdisplaycell">10Y Risk of ASCVD</td>
    </tr>
    <tr>
        <td class="riskdisplaycell"><span id = "risk" ></span></p>
        <td class="riskdisplaycell"><span id = "risk2" ></span></p>
    </tr>
</table>
<p>Risk Level: <span id = "risklevel" ></span></p>
<p style="font-size:24">5 Year NNT: <span id = "NNT" ></span></p>
<hr>
<p style="color:#990000;font-size:12;padding-left:35px;padding-right:35px">Estimates reflect broad risk categories and may not respond to all value changes.</p>
</div>
<?php
    if ($_GET['from'] == "paper") {
        ?><script type="text/javascript" src="calculate.js"></script><?php
    }
    else if ($_GET['from'] == "table") {
        ?><script type="text/javascript" src="calculate_from_table.js"></script><?php
    }
    else {
        ?><script type="text/javascript" src="calculate.js"></script><?php
    }
?>
<script type="text/javascript">

// preliminary settings
var form = document.getElementById('inputs');
<?php if ($_GET['from'] != "table") { ?>
form.age.value = 60;
form.sysBP.value = 120;
<?php } ?>
form.LDLC.value = 170;
form.percentLDLCreduction.value = 20;
//form.clinASCVD.checked = true;
//form.ismale[0].checked
//alert(form.s1.options['clinASCVD'].selected);
//alert(form['s1'].options['clinASCVD'].selected);


// default values
var formData = {'ismale' : 0, 'clinASCVD': 0, 'metabSyndrome': 0,'diabetic': 0,'antihyp': 0,'coronHeartDis': 0,'CVC': 0,'arterDisease': 0,'histStroke': 0,'ACShist': 0,'CKD': 0};

/**
 * php: paper-based or table-based form data arrays
 *
 * the server chooses between two sets of values here
 */
<?php if ($_GET['from'] != "table") { ?>   
// all keys for the data hashtable passed to the calculation
var formDataKeys = ['ismale','clinASCVD', 'metabSyndrome','diabetic','antihyp','coronHeartDis','CVC', 'arterDisease','histStroke','ACShist','CKD']; // keys that should start at value of zero
var riskfactorKeys = [];
// keys used in the drop-down selector
var selectorKeys = ['notadding','metabSyndrome','diabetic','coronHeartDis','CVC', 'arterDisease','ACShist','CKD','histStroke1','histStroke2','antihyp<4','antihyp4+']; // useable keys
// hashtable with readable names for drop-down selector
var selectorNames = {'notadding':'---','diabetic':'Diabetes','antihyp<4':'Antihypertensives (up to 4)','antihyp4+':'Antihypertensives (4 or more)','coronHeartDis':'Coronary Heart Disease','CVC':'CVC', 'arterDisease':'Arterial Disease','CKD':'Chronic Kidney Disease','ACShist':'History of Acute Coronary Syndrome','histStroke1':'History of Transient Ischemic Attack','histStroke2':'History of Stroke', 'metabSyndrome':'Metabolic Syndrome'}; // maps useable to readable keys 
<?php } else { ?>    
// some keys for the data hashtable passed to the calculation
var formDataKeys = ['clinASCVD', 'diabetic','recentACS','uncontrolled_ASCVD','fam_hypercholesterolemia']; // keys that should start at value of zero
var riskfactorKeys = [];
// keys used in the drop-down selector
var selectorKeys = [
    'notadding', 
    'diabetic',
    'recentACS',
    'uncontrolled_ASCVD',
    'fam_hypercholesterolemia',
    'CKD'
]; // useable keys
// hashtable with readable names for drop-down selector
var selectorNames = {
    'notadding':'---',
    'diabetic':'Diabetes',
    'recentACS' : 'Recent ACS (&lt;3 months)',
    'uncontrolled_ASCVD': 'Poorly Controlled ASCVD Risk Factors',
    'fam_hypercholesterolemia': 'Familial Hypercholesterolemia',
    'CKD' : 'Chronic Kidney Disease'
}; // maps useable to readable keys
<?php } ?>

// making the selector
var selector_beg = "<tbody><tr><td class='leftcolumncell'>Add Risk Factor:</td><td class = 'riskfactorcell'><select name = 'rf_selector'>";
var selector_end = "</select></td></tr></tbody>";
function makeSelector() {
    selectorText = selector_beg;
    for (var i in selectorKeys) {
        selectorText += "<option name = '" + selectorKeys[i] + "'>" + selectorNames[selectorKeys[i]] + "</option>";
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
<?php if ($_GET['from'] != "table") { ?>    
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
<?php } else { ?>
    formData[useable_key] = 0;
<?php } ?>
}

// function for when the form is submitted
function onformsubmission() {

    // check for new risk factors
    for (var key in selectorKeys) {
        if (form['rf_selector'].options[selectorKeys[key]].selected){
            useable = selectorKeys[key];
            if (useable == 'notadding') {           // does nothing if the form is not being used
<?php if ($_GET['from'] != "table") { ?>   
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
<?php } else { ?>
            } else if (useable == 'uncontrolled_ASCVD') {    // riskfactors implying ASCVD
                formData['uncontrolled_ASCVD'] = 1;
                form.clinASCVD.checked = true;
                addRiskFactor('uncontrolled_ASCVD');
<?php } ?>
            } else {                                // usually just sets the formData value to 1 and adds the risk value
                formData[selectorKeys[key]] = 1;
                addRiskFactor(selectorKeys[key]);
            }
        }
    }
    
    // reset the selector
    form['rf_selector'].options['notadding'].selected = true;
    
    // validate/reset other form data
<?php if ($_GET['from'] != "table") { ?>   
    // sex
    if (form.ismale[0].checked) formData['ismale'] = 1 ;
    else formData['ismale'] = 0;
<?php } ?>
    // Clinical ASCVD
    if (form.clinASCVD.checked) {
        formData['clinASCVD'] = 1;
    }
    else {
        formData['clinASCVD'] = 0;
<?php if ($_GET['from'] == "table") { ?>   
        // Remove 'uncontrolled_ASCVD' if ASCVD is removed
        if (formData['uncontrolled_ASCVD'] == 1) {
            removeRiskFactor('uncontrolled_ASCVD');
            formData['uncontrolled_ASCVD'] == 0;
        }
<?php } ?>
    }
    // percent LDL-C reduction
    if (0.0 <= form['percentLDLCreduction'].value && form['percentLDLCreduction'].value <= 100.0) {
        formData['percentLDLCreduction'] = form['percentLDLCreduction'].value / 100.0;
    } else {
        form.percentLDLCreduction.value = 100*formData['percentLDLCreduction'];
        document.getElementById('percent_validation').innerHTML = '0 &le; % LDL-C Reduction &le; 100';
        setTimeout(function(){
            document.getElementById('percent_validation').innerHTML = '';
        }, 3000);
    }
<?php if ($_GET['from'] != "table") { ?>   
    // age
    if (30 <= form['age'].value && form['age'].value <= 120) { 
        formData['age'] = form['age'].value;
    } else {
        form.age.value = formData['age'];
        document.getElementById('age_validation').innerHTML = '30 &le; Age &le; 120';
        setTimeout(function(){
            document.getElementById('age_validation').innerHTML = '';
        }, 3000);
    }
<?php } ?>
    // LDLC
    if (160 <= form['LDLC'].value && form['LDLC'].value <= 400) {
        formData['LDLC'] = form['LDLC'].value;
    } else {
        form.LDLC.value = formData['LDLC'];
        document.getElementById('LDLC_validation').innerHTML = '160 &le; LDL-C &le; 400';
        setTimeout(function(){
            document.getElementById('LDLC_validation').innerHTML = '';
        }, 3000);
    }
    // sysBP here (if not using table)
<?php if ($_GET['from'] != "table") { ?>    
    if (100 <= form['sysBP'].value && form['sysBP'].value <= 200) { 
        formData['sysBP'] = form['sysBP'].value;
    } else {
        form.sysBP.value = formData['sysBP'];
        document.getElementById('sysBP_validation').innerHTML = '100 &le; LDL-C &le; 200';
        setTimeout(function(){
            document.getElementById('sysBP_validation').innerHTML = '';
        }, 3000);
    }
<?php } ?>
    
    // calculate
    output = getOutput(formData);
    
    // gets the keys of output
    var keys = ['NNT','risk','risklevel'];
    for (var i = 0; i < keys.length;i++) {
        if (i == 1) { // display risks
            document.getElementById(keys[i]).innerHTML = "&ge; " + (Math.floor(output[keys[i]]*1000.0)/10.0).toString()+'%';
            document.getElementById(keys[i] + "2").innerHTML = "&ge; " + (Math.floor(2 * output[keys[i]]*1000.0)/10.0).toString()+'%';
        }
        else { // display NNT
            document.getElementById(keys[i]).innerHTML = output[keys[i]];
        }
    }
}
onformsubmission();

// tells the thing what to do!
form.addEventListener("change", onformsubmission);
</script>
<div>
