$(function(){
    $("#mainErrorMsg").hide();
    $("#submitErrorMsg").hide();
    $("#loading").hide();
    $("#payErrorMsg").hide();
    $("#payLoading").hide();
    $("#paymentSubmit").hide();
    braintree.dropin.create({ /* options */ }, null);


    var languagesList = ["Arabic", "Bulgarian" , "Chinese (Simplified)" ,
    "Chinese (Traditional)" , "Czech" , "Danish" , "Dutch" , "Finnish" , "French" ,
    "French (Canada)" , "German" , "Greek" , "Hebrew (Israel)" , "Hungarian" ,
    "Indonesian" , "Italian" , "Japanese" , "Korean" , "Malay " , "Norwegian" ,
    "Persian (Iran)" , "Polish" , "Portuguese" , "Portuguese (Brazil)" , "Romanian" ,
    "Russian" , "Serbian" , "Slovak" , "Spanish (Latin America)" , "Spanish" ,
    "Swedish" , "Tagalog (Philippines)" , "Thai" , "Turkish" , "Ukrainian" , "Vietnamese"]

    var selectedLanguagesList = []
    var backupLanguagesList = []

    var firstName = "";
    var lastName = "";
    var emailAddress = "";
    var translationText = "";
    var selectedLanguages = "";
    var wordsCount = 0;
    var finalCost = 0;
    var emailBody = "";

    $.each(languagesList, function (indexInArray, valueOfElement) { 
         $(".selections").append("<div class=\"form-check\"><label class=\"form-check-label\"><input type=\"checkbox\" class=\"form-check-input\" value=\"\" id=\"ch_"+indexInArray+"\" name=\""+valueOfElement+"\">"+valueOfElement+"</label></div>");
         $("#ch_"+indexInArray).change(function (e) { 
             e.preventDefault();
             if(this.checked){
                 selectedLanguagesList.push(this.name)
             }else{
                 selectedLanguagesList.splice(selectedLanguagesList.indexOf(this.name), 1)
             }
         });
    });

    
    var submit1=document.getElementById('submit1'),
    submit2=document.getElementById('submit2'),
    arrow=document.getElementById('arrow'),
    detailsBoard=document.getElementById('detailsBoard'),
    finalRes=document.getElementById('finalResult'),
    afterSub=document.getElementById('afterSub');
    
    submit1.onclick=function(){
        if(dataChecker()){
            detailsBoard.style.display='none'
            finalRes.classList.add('d-block')
        }

    }
    
    arrow.onclick=function(){
        finalRes.classList.remove('d-block')
        detailsBoard.style.display='block'
    }
    submit2.onclick=function(){
        $("#loading").show();
        $("#submitErrorMsg").hide();
        $("#submit2").prop('disabled', true);
        

        emailBody+="<h3>User Name</h3>";
        emailBody+="<p>"+firstName+" "+lastName+"</p>";
        emailBody+="<h3>Email Address</h3>";
        emailBody+="<p>"+emailAddress+"</p>";
        emailBody+="<h3>Text To Translate</h3>";
        emailBody+="<p>"+translationText+"</p>";
        emailBody+="<h3>Languages</h3>";
        emailBody+="<p>"+selectedLanguages+"</p><hr>";
        emailBody+="<h3>Words Count</h3>";
        emailBody+="<p>"+wordsCount+"</p>";
        emailBody+="<h3>Languages Count</h3>";
        emailBody+="<p>"+selectedLanguagesList.length+"</p><hr>";
        emailBody+="<strong>Final Cost:</strong> "+ finalCost+"£ (GBP)";

        var data = {
            userEmail: emailAddress,
            emailBody: emailBody
        }
        $.ajax({
            type: "POST",
            url: "./php/submit.php",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (response) {
                console.log("Response", response);
                $("#loading").hide();
                if(response.done){
                    finalRes.classList.remove('d-block')
                    afterSub.classList.add('d-block')
                }else{
                    $("#submit2").prop('disabled', false);
                    $("#submitErrorMsg").show();
                    $("#submitErrorMsg").html(response.msg);
                }
            }
        });
           
        
    }
    
    $("#payNow").click(function (e) { 
        e.preventDefault();
        $("#payLoading").show();
        $("#payErrorMsg").hide();
        $("#payNow").prop('disabled', true);
        $.ajax({
            type: "POST",
            url: "./php/braintree.php",
            data: JSON.stringify({type:"token"}),
            dataType: "json",
            success: function (response) {
                console.log("ResponsePayment", response);
                $("#payLoading").hide();
                
                braintree.dropin.create({
                      authorization: response.token,
                      container: '#dropin-container',
                      paypal: {
                        flow: 'checkout',
                        amount: finalCost,
                        currency: 'GBP'
                      }
                    }, function (createErr, instance) {
                        $("#payNow").prop('disabled', false);
                        if(createErr){
                            console.log("Create Error", createErr);
                        }else{
                            $("#payNow").hide();
                            $("#paymentSubmit").show();
                            $("#paymentSubmit").click(function (e) {
                                e.preventDefault();
                                instance.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
                                if(requestPaymentMethodErr){
                                    console.log("Request Error", requestPaymentMethodErr)
                                }else{
                                    console.log("NONCE", payload.nonce);
                                    $("#payLoading").show();
                                    $("#paymentSubmit").prop('disabled', true);
                                    $.ajax({
                                        type: "POST",
                                        url: "./php/braintree.php",
                                        data: JSON.stringify({
                                            type:"transaction",
                                            nonce:payload.nonce,
                                            amount:finalCost
                                        }),
                                        dataType: "json",
                                        success: function (response) {
                                            console.log("ResponseTransaction", response);
                                            $("#payLoading").hide();
                                            $("#payNow").prop('disabled', false);
                                            if(response.success){
                                                console.log("PAYMENT DONE SUCCESSFULLY");
                                                finalRes.classList.remove('d-block');
                                                detailsBoard.style.display='block'
                                                afterSub.classList.remove('d-block')
                                            }else{
                                                $("#payErrorMsg").show();
                                                $("#payErrorMsg").html(response.msg);
                                            }
                                        }
                                        
                                    });
                                }
                              
                            });
                            });
                            
                        }
                      
                    });
            }
            
        });
    });

    $("#selectLanguageBtn").click(function (e) { 
        e.preventDefault();
        backupLanguagesList = []
        backupLanguagesList.push(...selectedLanguagesList)

        $.each(languagesList, function (indexInArray, valueOfElement) {
            if(selectedLanguagesList.includes($("#ch_"+indexInArray).attr('name'))){
                $("#ch_"+indexInArray).prop('checked', true)
            }else{
                $("#ch_"+indexInArray).prop('checked', false)
            }
       });
    });

    $("#closeDialog").click(function (e) { 
        e.preventDefault();
        selectedLanguagesList = [];
        selectedLanguagesList.push(...backupLanguagesList);
    });

    $("#done").click(function (e) { 
        e.preventDefault();
        var languages = ""
        if(selectedLanguagesList.length > 0){
            selectedLanguagesList.sort();
            $.each(selectedLanguagesList, function (indexInArray, valueOfElement) { 
                 languages+=valueOfElement
                 if(indexInArray < (selectedLanguagesList.length-1)){
                     languages+=", "
                 }
            });
        }else{
            languages = "No languages selected"
        }

        $("#selectedLanguages").html(languages);
    });
    
    //Main Screen Code
    function dataChecker(){
        nameMatcher = "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'-]+$"
        emailMatcher = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
        firstName = $("#firstName").val();
        lastName = $("#lastName").val();
        emailAddress = $("#emailAddress").val();
        translationText = $("#translationText").val();
        selectedLanguages = $("#selectedLanguages").html();

        
        if(!firstName.match(nameMatcher)){
            showMainError("Invalid first name");
            return false
        }else if(!lastName.match(nameMatcher)){
            showMainError("Invalid last name");
            return false
        }else if(!emailAddress.match(emailMatcher)){
            showMainError("Invalid email address");
            return false
        }else if(translationText.length == 0){
            showMainError("You must enter at least one word");
            return false
        }else if(selectedLanguagesList.length == 0){
            showMainError("You must select at least one language");
            return false
        }else{
            $("#mainErrorMsg").hide();
            $("#loading").hide();
            setData();
            return true
        }

    }


    function showMainError(msg){
        $("#mainErrorMsg").show();
        $("#mainErrorMsg").html(msg);
    }

    function setData(){
        var countTranslationText = "";
        countTranslationText+=translationText;
        countTranslationText = countTranslationText.replace(/(\r\n|\n|\r)/gm," ").trim();
        wordsCount = countTranslationText.split(" ").length

        finalCost = wordsCount*selectedLanguagesList.length*0.05;
         
        $("#name").val(firstName+" "+lastName);
        $("#email").val(emailAddress);
        $("#wordsCount").val(wordsCount+" Words");
        $("#selectedLanguagesResult").val(selectedLanguages);
        $("#cost").val(finalCost.toFixed(2)+"£ (GBP)");

    }
});
