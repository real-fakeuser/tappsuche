(function (searchAndAdd, chayns, window, undefined) {
 
    'use strict';
    
    var listLength = 30;
    let listentries = 0;
    let lastSearch = "Tobit";
    let lastInputTime = 0;
    let newListLength = 20;
    let listTemplate = `
                        <div class="ListItem ListItem--clickable" id="$siteId">
                            <div class="listLinks" id="$siteId">
                                <div class="ListItem__head">
                                    <div style="background:url(https://sub60.tobit.com/l/$locationId)" class="ListItem__Image"> 
                                    </div>  
                                    <div class="ListItem__Title"> 
                                        <p class="ListItem__Title--headline">$Name</p> 
                                        <p class="ListItem__Title--description">$siteId</p>   
                                    </div> 
                                </div>  
                            </div>
                        </div>`;
//<div class=\"ListItem__head\"><div style=\"background:url(https://sub60.tobit.com/l/" + $locationId + ")\" class=\"ListItem__Image\">  </div>  <div class=\"ListItem__Title\"> <p class=\"ListItem__Title--headline\">" + $Name + "</p> <p class=\"ListItem__Title--description\">" + $siteId + "</p>   </div>  </div> </div>  </div>";

    
    searchAndAdd.init = function init(data) {
        chayns.ready.then(function () {
            document.querySelector('#SiteSearch').onkeyup = function() {_keyUpSearch();};
            document.querySelector('#showMore').addEventListener("click", function(){_enlargeList();});
            document.querySelector('#sendForm').addEventListener("click", _processForm);
            //document.querySelector('.listLinks').addEventListener();            
            _updateData("tobit");       //Default-Suche um Site mit Inhalt zu füllen
        });
    };
    function  _processForm() {
        var $name       =   document.querySelector('#frmName').value;
        var $address    =   document.querySelector('#frmAddress').value;
        var $eMailAddr  =   document.querySelector('#frmMailAddr').value;
        var $comment    =   document.querySelector('#frmComment').value;
        if ($name != "" && $address != ""){
            if (_eMailValid($eMailAddr)){
                var messageToSend = ('Anfrage Seite indizieren: \nName: ' + $name + '\nAdresse: ' + $address + '\neMail Adresse:' + $eMailAddr + '\nKommentar: ' + $comment);
                chayns.intercom.sendMessageToPage({
                    text: messageToSend
                }).then(function(data){            
                    if(data.status == 200)
                    chayns.dialog.alert(chayns.env.user.name + ', Deine Anfrage wurde gesendet. \nVielen Dank für die Nachfrage!');
                    _clearFrm();
                });
            }else{
                _syntaxAlert("Eingabefehler", "Gebe bitte eine gültige E-Mail Adresse an.");    
            }
        }else{
            _syntaxAlert("Eingabefehler", "Gebe bitte deinen Namen und deine Adresse ein.");
        }
    }
    
    
    function _clearFrm() {                                              //Formular zurücksetzen
        document.querySelector('#frmName').value = null;
        document.querySelector('#frmAddress').value = null;
        document.querySelector('#frmMailAddr').value = null;
        document.querySelector('#frmComment').value = null;
    }


    function _syntaxAlert(heading,content){                             //Chayns Meldung ausgeben
        chayns.dialog.alert(heading, content)
            .then(function (data) { 
            console.log(data) 
        });
    }


    function _eMailValid(mailAddr) {
        if (mailAddr.includes("@") && mailAddr.includes(".")){
            return(true);
        }else{
            return(false);
        }
    }


    function _keyUpSearch() {                        //Hier wird der Zeitpunkt des letzten Keyup-Events gespeichert und die Ausführung geplant
        var millisNow = new Date().getTime();
        lastInputTime = millisNow;
        setTimeout(_timeLockSearch,700);
    }


    function _timeLockSearch() {            //Prüfen ob das letzte Event relevant ist
        var millisNow = new Date().getTime();
        var timeDiff = millisNow - lastInputTime;
        if (timeDiff > 700){        
            lastInputTime = millisNow;      //Erneutes Event angeben um erneute Ausführung zu verhindern
            _search();                      //Suche ausführen und Seite aktualisieren
        }
    }


    function _enlargeList(){
        if (_showMoreexec()) {
            listLength += newListLength;
            _updateData(null,true);
        }
    }


    function _search(){                     //führt eine durch den Benutzer indizierte Suche aus
        chayns.showWaitCursor();            //Wartecursor einblenden
        var userInput = document.querySelector('#SiteSearch').value;
        if (userInput != null) {        //Bei Benutzereingabe Suche starten
            _updateData(userInput);
        }    
    }


    function _updateData(searchString, enlarge) {   //searchString enthält Suchstring, 
        chayns.showWaitCursor();            //Wartecursor einblenden
        if (enlarge) {                              //enlarge = true -> Erweiterungsmodus, nur nachladen
            searchString = lastSearch;
        }
        var result = _requery(searchString,enlarge);
        result.then(function(data){
            if (data != null){
                console.log(data);
            _editList(data,enlarge);            //daten enthält Array mit Daten, enlarge -> HTML-Liste erweitern
            }/*else{
                chayns.hideWaitCursor();
                _syntaxAlert('Fehler bei der SVGFESpecularLightingElement.', 'Es konnte kein Ergebniss ermittelt werden. Versuche es doch mit einem anderen Suchbegriff oder lade die Seite neu wenn dieser Fehler erneut auftritt.');
            }*/
        }).catch(function(data){
        });
    }


    function _requery(searchString, enlarge){
        var startIndex = 0;
        var lengthOfRequest = 0;

        if (!enlarge) {
            lengthOfRequest = listLength;
        }else{
            startIndex = listLength - newListLength;
            lengthOfRequest = newListLength;
        }
        return new Promise (function(resolve)
        {
                chayns.findSite(searchString, startIndex, lengthOfRequest).then(function(data) {
                    resolve(data);
                });
        });
        lastSearch = searchString;  //Den letzten Suchbegriff zwischenspeichern
    }

    
    function _editList(data,enlarge) {
        var i = 0;
        if (!enlarge) {
            document.querySelector('#siteList').innerHTML = ""; //Tabelle löschen wenn neue Liste angezeigt wird
            listentries = listentries;
        }else{
            //i = listLength - newListLength;             //Bei Erweiterung neuen Teil des Arrays anzeigen
        }
        do {
            var $siteId = data.Value[i].siteId;
            var $Name = data.Value[i].appstoreName;
            var $locationId = data.Value[i].locationId;
            //var $htmlListe = "   <div class=\"ListItem ListItem--clickable\">                    <div class=\"listLinks\" id=\""+ $siteId +"\"><div class=\"ListItem__head\"><div style=\"background:url(https://sub60.tobit.com/l/" + $locationId + ")\" class=\"ListItem__Image\">  </div>  <div class=\"ListItem__Title\"> <p class=\"ListItem__Title--headline\">" + $Name + "</p> <p class=\"ListItem__Title--description\">" + $siteId + "</p>   </div>  </div> </div>  </div>";
            var $htmlListe = listTemplate.replace("$siteId", $siteId);
                $htmlListe = $htmlListe.replace("$Name",$Name);
                $htmlListe = $htmlListe.replace("$siteId", $siteId);
                $htmlListe = $htmlListe.replace("$siteId", $siteId);

                $htmlListe = $htmlListe.replace("$locationId", $locationId);
            document.querySelector('#siteList').innerHTML += $htmlListe;
            i++;
            listentries++;
        } while (data.Value[i] != null)
        chayns.hideWaitCursor();                            //Liste geladen, WaitCursor deaktivieren.
        var resultList = document.getElementsByClassName("listLinks");
        for (var i = 0; i<resultList.length;i++) {
            resultList[i].addEventListener('click', _openUrl);
        }

    }
    var _openUrl = function() {
        var attribute = this.getAttribute("id");
        window.open('https://chayns.net/'+attribute);
    };

    function _showMoreexec() {
        if (listentries < listLength){
            return false;
        }else{
            return true;
        }
    }



})((window.searchAndAdd = {}), chayns, window);

searchAndAdd.init();
