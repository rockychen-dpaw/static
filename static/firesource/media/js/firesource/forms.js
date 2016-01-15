goog.require('firesource.session');
goog.provide('firesource.forms');

s.ui.forms = {}

firesource.forms.presubmit = function(formData, jqForm, options) { 
    var form = jqForm[0];
    $.merge(formData, [{"name":"mod","value":form.className.split(' ')[1]+"_formpost"},
        {"name":"formid","value":form.id}]);
 
    // here we could return false to prevent the form from being submitted; 
    // returning anything other than false will allow the form submit to continue 
    return true; 
} 
 
// post-submit callback 
firesource.forms.postsubmit = function(responseText, statusText, xhr, $form)  { 
    // for normal html responses, the first argument to the success callback 
    // is the XMLHttpRequest object's responseText property 
 
    // if the ajaxSubmit method was passed an Options Object with the dataType 
    // property set to 'xml' then the first argument to the success callback 
    // is the XMLHttpRequest object's responseXML property 
 
    // if the ajaxSubmit method was passed an Options Object with the dataType 
    // property set to 'json' then the first argument to the success callback 
    // is the json data object returned by the server 
 
} 

firesource.forms.decorate = function() {
    var options = { 
        url: '/json', 
        dataType:'json', 
        success: null, //What to call after a reply from Django
        beforeSubmit: firesource['forms']['presubmit'],
        afterSubmit: firesource['forms']['postsubmit']
    };
    // bind forms using ajaxForm 
    $('form.uniForm').ajaxForm(options);
    $('a:visible').each(function(i,e){$(this).attr('tabindex', -1);});
}

