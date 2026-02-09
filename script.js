const params = new URLSearchParams(window.location.search);
const userId = params.get("id");
const content = document.getElementById("content");
let currentLang = "ar";
let userData = null; // لتخزين البيانات محلياً للتبديل السريع

const translations = {
  ar: {
    loading: "جارٍ التحميل...",
    invalid: "QR غير صالح",
    title_view: "📋 البيانات المسجلة",
    title_form: "📝 تأمين بيانات السائح",
    label_name: "الاسم الكامل",
    label_nationality: "الجنسية",
    label_age: "العمر",
    label_blood: "فصيلة الدم",
    label_phone: "رقم التواصل (المحلي)",
    label_emergency: "رقم طوارئ دولي (الأهل)",
    label_hotel: "اسم الفندق / مكان الإقامة",
    label_notes: "معلومات طبية هامة (حساسية، أمراض)",
    label_pin: "كود سري للتعديل",
    btn_save: "حفظ بيانات الأمان",
    btn_edit: "تعديل البيانات",
    placeholder_name: "اكتب الاسم كما في الجواز",
    placeholder_nationality: "مثال: مصري، سعودي...",
    placeholder_age: "العمر",
    placeholder_blood: "مثال: A+, O-",
    placeholder_phone: "رقم الهاتف المحلي",
    placeholder_emergency: "رقم الأهل مع كود الدولة",
    placeholder_hotel: "اسم الفندق وعنوانه",
    placeholder_notes: "اكتب هنا أي تفاصيل صحية أو أدوية...",
    placeholder_pin: "اختر كود سري (أرقام)",
    placeholder_edit_pin: "ادخل الكود السري للتعديل",
    err_pin: "الكود السري غير صحيح ❌",
    err_fill: "برجاء ملء جميع الحقول المطلوبة ❌",
    no_data: "لا يوجد"
  },
  en: {
    loading: "Loading...",
    invalid: "Invalid QR",
    title_view: "📋 Registered Information",
    title_form: "📝 Tourist Safety Data",
    label_name: "Full Name",
    label_nationality: "Nationality",
    label_age: "Age",
    label_blood: "Blood Type",
    label_phone: "Local Contact Number",
    label_emergency: "International Emergency No.",
    label_hotel: "Hotel / Accommodation",
    label_notes: "Medical Info (Allergy, Diseases)",
    label_pin: "Secret PIN for Editing",
    btn_save: "Save Safety Data",
    btn_edit: "Edit Information",
    placeholder_name: "Full name as in passport",
    placeholder_nationality: "e.g. British, American...",
    placeholder_age: "Age",
    placeholder_blood: "e.g. A+, O-",
    placeholder_phone: "Local phone number",
    placeholder_emergency: "Family number with country code",
    placeholder_hotel: "Hotel name and address",
    placeholder_notes: "Mention allergies, chronic diseases or meds...",
    placeholder_pin: "Choose a secret PIN",
    placeholder_edit_pin: "Enter Secret PIN to edit",
    err_pin: "Incorrect PIN ❌",
    err_fill: "Please fill all required fields ❌",
    no_data: "N/A"
  }
};

function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  document.getElementById("langBtn").innerText = currentLang === "ar" ? "English" : "عربي";
  document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
  
  if (userData) {
    showData(userData);
  } else {
    const isForm = document.getElementById("saveBtn") !== null;
    if (isForm) {
      const currentInputs = {
        name: document.getElementById("name").value,
        nationality: document.getElementById("nationality").value,
        age: document.getElementById("age").value,
        bloodType: document.getElementById("bloodType").value,
        phone: document.getElementById("phone").value,
        emergencyContact: document.getElementById("emergencyContact").value,
        hotelName: document.getElementById("hotelName").value,
        notes: document.getElementById("notes").value,
        userPin: document.getElementById("userPin").value
      };
      showForm(currentInputs.userPin, currentInputs);
    }
  }
}

if (!userId) {
  content.innerHTML = `<p class='warning'>${translations[currentLang].invalid}</p>`;
} else {
  db.collection("users").doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        userData = doc.data();
        showData(userData);
      } else {
        showForm("");
      }
    })
    .catch(err => {
      console.error(err);
      content.innerHTML = "<p class='warning'>Firebase Connection Error</p>";
    });
}

function showData(d) {
  const t = translations[currentLang];
  userData = d;
  content.innerHTML = `
    <h2>${t.title_view}</h2>
    <div class="info-box">
      <p><strong>${t.label_name}:</strong> ${d.name}</p>
      <p><strong>${t.label_nationality}:</strong> ${d.nationality}</p>
      <p><strong>${t.label_age}:</strong> ${d.age}</p>
      <p><strong>${t.label_blood}:</strong> ${d.bloodType || t.no_data}</p>
      <p><strong>${t.label_phone}:</strong> ${d.phone}</p>
      <p><strong>${t.label_emergency}:</strong> ${d.emergencyContact}</p>
      <p><strong>${t.label_hotel}:</strong> ${d.hotelName || t.no_data}</p>
      <p><strong>${t.label_notes}:</strong><br>${d.notes || t.no_data}</p>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <input id="editPin" type="password" placeholder="${t.placeholder_edit_pin}" class="pin-input">
      <button id="editBtn" class="edit-style">${t.btn_edit}</button>
    </div>
  `;

  document.getElementById("editBtn").onclick = () => {
    const secretPin = document.getElementById("editPin").value.trim();
    if (secretPin === d.userPin) {
      userData = null;
      showForm(secretPin, d);
    } else {
      showError(t.err_pin);
    }
  };
}

function showForm(userPin, savedData = {}) {
  const t = translations[currentLang];
  content.innerHTML = `
    <h2>${t.title_form}</h2>
    <label>${t.label_name}</label>
    <input id="name" placeholder="${t.placeholder_name}" value="${savedData.name || ''}">

    <label>${t.label_nationality}</label>
    <input id="nationality" placeholder="${t.placeholder_nationality}" value="${savedData.nationality || ''}">

    <div style="display: flex; gap: 10px;">
      <div style="flex: 1;">
        <label>${t.label_age}</label>
        <input id="age" type="number" placeholder="${t.placeholder_age}" value="${savedData.age || ''}">
      </div>
      <div style="flex: 1;">
        <label>${t.label_blood}</label>
        <input id="bloodType" placeholder="${t.placeholder_blood}" value="${savedData.bloodType || ''}">
      </div>
    </div>

    <label>${t.label_phone}</label>
    <input id="phone" type="tel" placeholder="${t.placeholder_phone}" value="${savedData.phone || ''}">

    <label>${t.label_emergency}</label>
    <input id="emergencyContact" type="tel" placeholder="${t.placeholder_emergency}" value="${savedData.emergencyContact || ''}">

    <label>${t.label_hotel}</label>
    <input id="hotelName" placeholder="${t.placeholder_hotel}" value="${savedData.hotelName || ''}">

    <label>${t.label_notes}</label>
    <textarea id="notes" placeholder="${t.placeholder_notes}">${savedData.notes || ''}</textarea>

    <label>${t.label_pin}</label>
    <input id="userPin" type="password" placeholder="${t.placeholder_pin}" value="${userPin || savedData.userPin || ''}">

    <button id="saveBtn">${t.btn_save}</button>
  `;

  document.getElementById("saveBtn").onclick = saveData;
}

function saveData() {
  const t = translations[currentLang];
  const data = {
    name: document.getElementById("name").value.trim(),
    nationality: document.getElementById("nationality").value.trim(),
    age: document.getElementById("age").value.trim(),
    bloodType: document.getElementById("bloodType").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    emergencyContact: document.getElementById("emergencyContact").value.trim(),
    hotelName: document.getElementById("hotelName").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    userPin: document.getElementById("userPin").value.trim()
  };

  if (!data.name || !data.userPin) {
    showError(t.err_fill);
    return;
  }

  db.collection("users").doc(userId).set(data)
    .then(() => {
      userData = data;
      showData(data);
    })
    .catch(err => console.error(err));
}

function showError(msg) {
  const old = document.getElementById("errorMsg");
  if (old) old.remove();
  const div = document.createElement("div");
  div.id = "errorMsg";
  div.innerText = msg;
  div.className = "error-banner";
  content.querySelector("h2").insertAdjacentElement('afterend', div);
}