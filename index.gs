var token = "xxxx"; // token telegram
var ssId = "xxxx"; // ID spreadsheets
var UrlPublish = "xxxx"; // url deploy

var telegramUrl = "https://api.telegram.org/bot" + token;
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var sheetName = monthNames[new Date().getMonth()];
//persiapan pengiriman data
function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + encodeURIComponent(text);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

//melakukan proses simpan dan ambil data
function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    var text = data.message.text;
    
  if(/new/.test(text)) {
    var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName) ? SpreadsheetApp.openById(ssId).getSheetByName(sheetName) : SpreadsheetApp.openById(ssId).insertSheet(sheetName);
    var item;
    if (text.split(" ")[1].includes("-")) {
      item = text.split(" ")[1].split("-").join(" ");
    } else {
      item = text.split(" ")[1]
    }
    var jumlah = text.split(" ")[2];
    var harga = text.split(" ")[3];
    var total = parseInt(jumlah) * parseInt(harga);
    var id = data.message.chat.id;
    var name = data.message.chat.first_name;
    // simpan ke google sheet
    if (item && jumlah && harga) {
      
      sheet.appendRow([item,jumlah, harga, total ,id,name,new Date()]);
      // tampilkan ke telegram bot
      sendText(id,"Item :"+"\n"+"'"+ item + "'"+"\n"+"\n"+"Success!");
    } else {
      sendText(id, "Permintaan Tidak Dapat diproses." + "\n" + "Mohon isi semua bagian yang diperlukan!");
    }
  } else{
//--------------------------------------------------------------------------------------------------------------
//kirim data ke telegram bot
  var stringJson = e.postData.getDataAsString();
  var updates = JSON.parse(stringJson);
    if(updates.message.text){
      sendText(updates.message.chat.id,findDataBySheetId(updates.message.text)); 
    }
  }
}  
//--------------------------------------------------------------------------------------------------------------
//ambil data dari google spreadsheets
//menentukan sheets mana yang akan diambil
function getSheet(){
  var rangeName = sheetName + "!A2:G";
  var rows = Sheets.Spreadsheets.Values.get(ssId, rangeName).values;
  return rows;
}

//menentukan kolom mana yang akan diambil
function findDataBySheetId(IDdata){
  var dataSheet = getSheet(); 
  let totalAll = dataSheet.reduce((prev, row) => parseInt(prev) + parseInt(row[3]),0);
  for (var row = 0; row < dataSheet.length; row++) {
    if(dataSheet[row][0].toLowerCase() == IDdata.toLowerCase()){ 
      return "Detail Item : "+"\n"+"'"+ dataSheet[row][0] +"'"+"\n" +"\n" +
             "Jumlah : " + dataSheet[row][1] + "\n" + 
             "Harga @ : " + dataSheet[row][2] + "\n" +
             "Tanggal : " + dataSheet[row][6] + "\n" + 
             "Total Pengeluaran Saat Ini: " + totalAll
    }
  }
  return "Item tidak ditemukan.";
}

// activating webhook
//https://api.telegram.org/botTOKENBOT/setwebhook?url=URLPUBLISH
