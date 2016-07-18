 /**
  * calculate.js
  * by Ted Morin
  * 
  * contains a function to calculate the NNT for nonstatin treatment based on Robinson, Jennifer et al.'s research
  *
  **/
    
    // expects a hash table with all risk factors
    function getOutput(data) {
        var leastrisk = 1.0;
        /**
         * finds the least risk and return output calculated from it
         *
         * i.e. the lower bound of risk for the patient's WORST risk category
         **/
        // ASCVD
        if (data['clinASCVD']){
            if ((data['diabetic']) || (data['recent_ACS']) || (data['uncontrolled_ASCVD']) || (data['CKD']) || (data['LDLC'] >= 190) || (data['fam_hypercholesterolemia'])) {
                leastrisk = 0.15; // with comorbidities
                return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
            } else {
                leastrisk = 0.10; // without comorbidities
                return makeOutputWithRisk(leastrisk, data['LDLC'], data['percentLDLCreduction']);
            }
        } else if ((data['fam_hypercholesterolemia']) || (data['LDLC'] >= 190)) {
            leastrisk = 0.10; // certain comorbidities alone
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
