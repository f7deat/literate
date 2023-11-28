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
        Toastify({ text: `Nhập mã số thuế ${taxCode.value} thành công!`, duration: 3000 }).showToast();
    }
});

const nextTax = () => {
    const taxCode = document.querySelector('input[name="mst"]');
    const tax_codesStorage = localStorage.getItem('tax_codes');
    if (tax_codesStorage) {
        let tax_codes = tax_codesStorage.split(',');
        // Xóa mã số thuế đã nhập
        tax_codes = tax_codes.filter(x => x !== taxCode.value);
        localStorage.setItem('tax_codes', tax_codes.join(','));
        // Nạp mã số thuế tiếp theo
        if (tax_codes.length > 0) {
            taxCode.value = tax_codes[0];
        }
        const taxtCodesElement = document.querySelector('#taxCodes');
        if (taxtCodesElement) {
            taxtCodesElement.value = tax_codes.join(',');
        }
    }
}

const init = () => {
    const taxCode = document.querySelector('input[name="mst"]');
    if (!document.querySelector('#taxCodes')) {
        const container = document.createElement('div');
        container.classList.add('tax_codes');
        const input = document.createElement('textarea');
        if (localStorage.getItem('tax_codes')) {
            input.value = localStorage.getItem('tax_codes');
        }
        input.id = 'taxCodes'
        container.append(input);
        const btnTaxCodes = document.createElement('button');
        btnTaxCodes.textContent = 'Nạp dữ liệu';
        btnTaxCodes.classList.add('btn');
        btnTaxCodes.addEventListener('click', () => {
            if (!input.value) {
                Toastify({ text: "Vui lòng nạp dữ liệu!", duration: 3000 }).showToast();
                return;
            }
            const tax_codes = input.value.split('\n');
            taxCode.value = tax_codes[0];
            localStorage.setItem('tax_codes', tax_codes.join(','));
            input.value = tax_codes.join(',')
        });
        container.append(btnTaxCodes);
        document.body.append(container);
    }

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
                'Note': record[6].textContent.trim(),
                'Director': '',
                'DirectorAddress': ''
            }
            if (!data.find(x => x.MST === record[1].textContent.trim())) {
                data.push(item)
                localStorage.setItem('meta_panic', JSON.stringify(data));
            }
            const form = document.querySelector('form');
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
            data[index].Director = table.rows[12].cells[1].textContent.trim();
            data[index].DirectorAddress = table.rows[11].cells[3].textContent.trim();
            localStorage.setItem('meta_panic', JSON.stringify(data));
            nextTax();
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

btnDownload.addEventListener('click', function () {
    const data = localStorage.getItem('meta_panic');
    if (!data) {
        Toastify({ text: "Chưa có dữ liệu!", duration: 3000 }).showToast();
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
    Toastify({ text: "Xóa thành công!", duration: 3000 }).showToast();
})