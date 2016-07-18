 /**
  * calculate.js
  * by Ted Morin
  * 
  * contains a function to calculate the NNT for nonstatin treatment based on Pencina et al.'s research
  *
  **/
    
    // expects a hash table with all risk factors
    function getOutput(data) {
        var leastrisk = 1.0;
        // finds the least risk and return output calculated from it
        if (data['clinASCVD'] && data['LDLC'] >= 190.0 && data['ACShist']){
            leastrisk = 0.215;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD'] && data['CKD']) {
            leastrisk = 0.17;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD'] && data['ACShist']) {
            leastrisk = 0.16;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if ((data['clinASCVD'] && data['LDLC'] >= 190.0) || (data['histStroke'] && data['ismale'])) {
            leastrisk = 0.15;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if ((data['arterDisease'] && data['CVC']) || (data['coronHeartDis'])) {
            leastrisk = 0.15;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD'] && data['smoker']) {
            leastrisk = 0.14;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD'] && (data['antihyp'] >= 4 || (data['antihyp'] >= 1 && data['sysBP'] >= 140.0) )){
            leastrisk = 0.14;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD'] && data['diabetic']) {
            leastrisk = 0.13;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if ( data['clinASCVD'] && !(data['CKD']) ) {
            leastrisk = 0.11;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        /** none of the lines would ever be used because they would all rely on ASCVD, and ASCVD is accounted for
        } else if (!(data['ismale']) && data['histStroke']) {
            leastrisk = 0.10;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['age'] > 65.0 || ) {
            leastrisk = 0.10;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if (data['clinASCVD']) {
            leastrisk = 0.10;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else if () {
            leastrisk = 0.08;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        **/
        } else if (data['metabSyndrome']) {
            leastrisk = 0.075;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        } else {
            leastrisk = 0.05;
            return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
        }
    }
        
    function makeOutputWithRisk(riskval, LDLC, percentLDLCreduction) {   
        var NNT = 1.0 /(riskval*0.21*LDLC/39.0*percentLDLCreduction) ;
        NNT = Math.round(NNT+0.5);
        var risklevel = "MODERATE";
        if(riskval >= 0.1 ) risklevel = "HIGH";
        if(riskval >= 0.15) risklevel = "VERY HIGH";
        return {'NNT':NNT,'risk':riskval,'risklevel':risklevel};
    }
/** Test code below (run with rhino)
var data = {
    'clinASCVD' : 1,
    'LDLC' : 155.0,
    'ACShist' : 0,
    'percentLDLCreduction' : 0.20,
    'CKD' : 0,
    'histStroke' : 0,
    'ismale' : 0,
    'arterDisease' : 0,
    'CVC' : 0,
    'coronHeartDis' : 0,
    'smoker' : 0,
    'antihyp' : 4,
    'diabetic' : 0,
    'age' : 60,
    'metabSyndrome' : 0,
    'sysBP':120
};
var output = getOutput(data);
//print('made it!');
print(output['NNT'].toString());
print(output['risk'].toString());
print(output['risklevel']);
*/
