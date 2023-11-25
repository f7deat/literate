const captcha = document.querySelector("#captcha");

captcha.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const taxCode = document.querySelector('input[name="mst"]');
        if (!taxCode || !taxCode.value) {
            console.log('Vui lòng nhập mã số thuế!');
            return;
        }
        const btn = document.querySelector('.subBtn');
        btn.click();
        console.log('OK!');
    }
});

const init = () => {
    const taxCode = document.querySelector('input[name="mst"]');
    if (!taxCode || !taxCode.value) {
        return;
    }
    const table = document.querySelector('.ta_border');
    if (!table) {
        return;
    }
    const title = document.querySelector('h3').textContent.trim();
    if (title === 'BẢNG THÔNG TIN TRA CỨU:') {
        const record = table.rows[1].cells;
        if (record) {
            let data = JSON.parse(localStorage.getItem('meta_panic') || '[]');
            const item = {
                'STT': data.length + 1,
                'MST': record[1].textContent.trim(),
                'Name': record[2].textContent.trim(),
                'Address': '',
                'CCCD': record[4].textContent.trim(),
                'Note': record[6].textContent.trim()
            }
            // const item = `'${record[1].textContent.trim()},${record[2].textContent.trim()},${record[3].textContent.trim()},'${record[4].textContent.trim()},${record[5].textContent.trim()}`;
            if (!data.find(x => x.MST === record[1].textContent.trim())) {
                data.push(item)
                // data += item + ',';
                localStorage.setItem('meta_panic', JSON.stringify(data));
            }
            let form = document.querySelector('form');
            form.id.value = item.MST;
            form.submit();
        }
    }
    if (title === 'Thông tin chi tiết: Đầu trang') {
        let data = JSON.parse(localStorage.getItem('meta_panic') || '[]');
        const table = document.querySelector('.ta_border');
        const taxCode = table.rows[0].cells[1].textContent.trim();
        const index = data.findIndex(x => x.MST === taxCode);
        if (index !== -1) {
            data[index].Address = table.rows[3].cells[1].textContent.trim();
            localStorage.setItem('meta_panic', JSON.stringify(data));
        }
    }
}

init();

function addOn() {
    const cssId = 'myCss';
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css';
        head.appendChild(link);
    }
}

addOn();

const div = document.createElement('div');
div.style.setProperty('display', 'flex');
div.style.setProperty('gap', '1rem');

const btnDownload = document.createElement('button');
btnDownload.textContent = 'Download';
btnDownload.type = 'button';
btnDownload.style.setProperty('background', '#c4141b');
btnDownload.style.setProperty('color', 'white');
btnDownload.style.setProperty('cursor', 'pointer');
btnDownload.style.setProperty('border', '0');
btnDownload.style.setProperty('padding', '0.5rem 1rem');
btnDownload.style.setProperty('display', 'block');
btnDownload.style.setProperty('width', '100%');

const btnClear = document.createElement('button');
btnClear.textContent = 'Xóa cache';
btnClear.type = 'button';
btnClear.style.setProperty('background', '#c4141b');
btnClear.style.setProperty('color', 'white');
btnClear.style.setProperty('cursor', 'pointer');
btnClear.style.setProperty('border', '0');
btnClear.style.setProperty('padding', '0.5rem 1rem');
btnClear.style.setProperty('display', 'block');
btnClear.style.setProperty('width', '100%');

div.append(btnDownload);
div.append(btnClear);

document.querySelector('#tcmst').append(div);

makeTextFile = function (text) {
    var data = new Blob([decodeURIComponent('%ef%bb%bf'), text], { type: 'text/csv;charset=utf-8' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    var textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};

btnDownload.addEventListener('click', function () {
    const data = localStorage.getItem('meta_panic');
    if (!data) {
        alert('Dữ liệu trống!');
        return;
    }
    filename = 'reports.xlsx';
    const ws = XLSX.utils.json_to_sheet(JSON.parse(data));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb, filename);
}, false);

btnClear.addEventListener('click', () => {
    localStorage.clear();
    alert('Xóa thành công!');
})