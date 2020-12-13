let isUpdate = false;
let employeePayrollObj = {};
window.addEventListener('DOMContentLoaded', (event) => {
    const name = document.querySelector('#name');
    const nameError = document.querySelector('.name-error');
    name.addEventListener('input', function() {
        if(name.value.length == 0) {
            nameError.textContent = "";
            return;
        }
        try {
            checkName(name.value);
            nameError.textContent = "";
        } catch (e) {
            nameError.textContent = e;
        }
    }); 

    const date = document.querySelector('#startDate');
    date.addEventListener('input', function() {
        let startDate = document.querySelector("#day").value + " " +
                        document.querySelector("#month").value + " " +
                        document.querySelector("#year").value;
        try {
            checkStartDate(new Date(Date.parse(startDate)));
            setTextValue('.date-error', "");
        } catch (e) {
            setTextValue('.date-error', e);
        }
    });

    const salary = document.querySelector('#salary');
    const output = document.querySelector('.salary-output');
    output.textContent = salary.value;
    salary.addEventListener('input', function () {
        output.textContent = salary.value;
    });

    document.querySelector('#cancelButton').href = site_properties.home_page;
    checkForUpdate();
}); 

class EmployeePayrollData{
    // getters and setters
    get id() {return this._id;}
    set id(id){
        this._id=id;
    }
    get name(){ return this._name;}
    set name(name){
        let nameRegex = RegExp('^[A-Z]{1}[a-z]{3,}$')
        if(nameRegex.test(name)) this._name = name;
        else throw "Name is Incorrect!";
    }

    get profilePic() {return this._profilePic;}
    set profilePic(profilePic){
        this._profilePic = profilePic;
    }

    get gender() {return this._gender;}
    set gender(gender){
        this._gender = gender;
    }

    get department() {return this._department;}
    set department(department){
        this._department = department;
    }

    get salary() {return this._salary;}
    set salary(salary){
        this._salary = salary;
    }

    get startDate() {return this._startDate;}
    set startDate(newDate){
        let now = new Date();
        if(newDate > now) 
            throw "Start Date Is A Future Date!";
        var diff = Math.abs(now.getTime() - newDate.getTime());
        if(diff / (1000 * 60 * 60 * 24) > 30)
            throw "Start Date Is A Beyond 30 Days!";
        this._startDate = newDate;
    }

    get notes() {return this._notes}
    set notes(notes){
        this._notes = notes;
    }

    //toString method
    toString(){
        return "id="+this.id+" : name="+this.name+
                " : gender="+this.gender+" : Dept="+this.department+
                " : salary="+this.salary+" : Start Date="+this.startDate
                +" : Notes="+this.notes;
    }
}
const save = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try{
        setEmployeePayrollObject();
        if(site_properties.use_local_storage.match("true")) {
            createAndUpdateStorage();
            resetForm();
            window.location.replace(site_properties.home_page);
        } else {
            createOrUpdateEmployeePayroll();
        }
    }catch(exception){
        console.error(exception);
        return;
    }
}

const createOrUpdateEmployeePayroll = () => {
    let postURL = site_properties.server_url;
    let methodCall = "POST";
    if(isUpdate) {
        methodCall = "PUT";
        postURL = postURL + "/" + employeePayrollObj.id.toString(); 
    }
    makeServiceCall(methodCall, postURL, true, employeePayrollObj)
        .then(responseText => {
            resetForm();
            window.location.replace(site_properties.home_page);
        })
        .catch(error => {
            throw error;
        });
}

function setEmployeePayrollObject() {
    try {
        if(!isUpdate) employeePayrollObj.id = createNewEmployeeId();
        employeePayrollObj._name = document.getElementById('name').value;
        employeePayrollObj._profilePic = getRadioValue(document.getElementsByName('profile'));
        employeePayrollObj._gender = getRadioValue(document.getElementsByName('gender'));
        employeePayrollObj._department = getCheckBoxValue(document.getElementsByClassName('checkbox'));
        employeePayrollObj._salary = document.getElementById('salary').value;
        employeePayrollObj._notes = document.getElementById('notes').value;

        let start = new Array();
        start.push(document.getElementById('day').value);
        start.push(document.getElementById('month').value);
        start.push(document.getElementById('year').value);
        employeePayrollObj._startDate = new Date(start[2],start[1],start[0]);
    }
    catch (exception) {
        console.error(exception);
    }
}

function createAndUpdateStorage() {
    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
    if(employeePayrollList){
        let employeeData = employeePayrollList.
                            find(empData => empData._id == employeePayrollObj._id);
        if (!employeeData) {
            employeePayrollList.push(employeePayrollObj);
        } else{
            const index = employeePayrollList.map(empData => empData._id)
                                             .indexOf(employeeData._id);
            employeePayrollList.splice(index, 1, employeePayrollObj);
        }
    }else{
        employeePayrollList = [createEmpData()];
    }
    console.log(employeePayrollList);
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList));
}

const createEmpData = (id) => {
    let employeePayrollData = new EmployeePayrollData();
    if (!id) employeePayrollData.id = createNewEmployeeId();
    else employeePayrollData.id = id;
    setEmployeePayrollData(employeePayrollData);
    return employeePayrollData;
}

function setEmployeePayrollData(employeePayrollData){
    try {
        employeePayrollData.name = employeePayrollObj._name;
    } catch (e) {
        setTextValue('.name-error', e);
    }
    employeePayrollData.profilePic = employeePayrollObj._profilePic;
    employeePayrollData.gender = employeePayrollObj._gender;
    employeePayrollData.department = employeePayrollObj._department;
    employeePayrollData.salary = employeePayrollObj._salary;
    employeePayrollData.notes = employeePayrollObj._notes;
    try {
        employeePayrollData.startDate = new Date(Date.parse(employeePayrollObj._startDate));
    } catch (e) {
        setTextValue('.date-error', e);
        throw e;
    }
    alert(employeePayrollData.toString());
}

const createNewEmployeeId = () => {
    let empId = localStorage.getItem("EmployeeID");
    empId = !empId ? 1 : (parseInt(empId)+1).toString();
    localStorage.setItem("EmployeeID", empId);
    return empId;
}

function getCheckBoxValue(boxes) {
    let boxlist = []
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            boxlist.push(boxes[i].value)
        }
    }
    return boxlist;
}

function getRadioValue(radios) {
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}

const checkForUpdate = () => {
    const employeePayrollJson = localStorage.getItem('editEmp');
    isUpdate = employeePayrollJson ? true : false;
    if(!isUpdate) return;
    employeePayrollObj = JSON.parse(employeePayrollJson);
    setForm();
}

const setForm = () => {
    console.log(employeePayrollObj);
    setValue('#name',employeePayrollObj._name);
    setSelectedValues('[name=profile]',employeePayrollObj._profilePic);
    setSelectedValues('[name=gender]',employeePayrollObj._gender);
    setCheckBox('[name=department]',employeePayrollObj._department);
    setValue('#salary',employeePayrollObj._salary);
    setTextValue('.salary-output',employeePayrollObj._salary);
    setValue('#notes',employeePayrollObj._notes);
    let date = employeePayrollObj._startDate.toString().slice(0,10).split("-");
    setValue('#day', (Number.parseInt(date[2]) + 1) % 31);
    setValue('#month', date[1]);//Number.parseInt(date[1]) - 1);
    setValue('#year',date[0]);
}

const resetForm = () => {
    setValue('#name', ' ');
    unsetSelectedValue('[name=profile]');
    unsetSelectedValue('[name=gender]');
    unsetSelectedValue('[name=department]');
    setValue('#salary', '');
    setValue('#notes', '');
    setValue('#day', '1');
    setValue('#month', 'January');
    setValue('#year', '2020');
    setSelectedIndex('#day', 0);
    setSelectedIndex('#month', 0);
    setSelectedIndex('#year', 0);//localStorage.removeItem('editEmp');
}

const unsetSelectedValue = (propertyValue) => {
    let allItems = document.querySelectorAll(propertyValue);
    allItems.forEach(item => {
        item.checked = false;
    });
}
const setValue = (id, value) => {
    const element = document.querySelector(id);
    element.value = value;
}

const setSelectedIndex = (id, index) => {
    const element = document.querySelector(id);
    element.selectedIndex = index;
}

const setSelectedValues = (propertyValue,value)=>{
    let allItems = document.querySelectorAll(propertyValue);
    allItems.forEach(item => {
        if(Array.isArray(value)){
            if(value.includes(item.value)){
                item.checked = true;
            }
        }
        else if(item.value==value)
        item.checked = true;
    });
}
const setCheckBox = (property, values) => {
    let items = document.querySelectorAll(property);
    items.forEach(item => {
        if (values.includes(item.value)) {
            item.checked = true;
        }
    });
}
const setTextValue=(id,value)=>{
    const element = document.querySelector(id)
    element.textContent=value;
}

function getEmpDataFromLocalStorage() {
    return localStorage.getItem("EmployeePayrollList") ?
        JSON.parse(localStorage.getItem("EmployeePayrollList")) :
        [];
}