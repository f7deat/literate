// Configuration
const CONFIG = {
    TOAST_DURATION: 3000,
    EXCEL_FILENAME: 'reports.xlsx',
    TAILWIND_CSS_URL: 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css'
};

// Constants
const STORAGE_KEYS = {
    TAX_CODES: 'tax_codes',
    META_PANIC: 'meta_panic'
};

const SELECTORS = {
    CAPTCHA: '#captcha',
    TAX_INPUT: 'input[name="mst"]',
    SUBMIT_BTN: '.subBtn',
    TAX_CODES: '#taxCodes',
    TABLE: '#detail .ta_border',
    TABLE_SEARCH: '#resultContainer .ta_border',
    TITLE: 'h3',
    FORM: 'form[name=myform]'
};

const TITLES = {
    SEARCH_INFO: 'BẢNG THÔNG TIN TRA CỨU:',
    DETAIL_INFO: 'Thông tin chi tiết: Đầu trang'
};

const MESSAGES = {
    EMPTY_TAX_CODE: 'Vui lòng nhập mã số thuế!',
    TAX_CODE_SUCCESS: 'Nhập mã số thuế {taxCode} thành công!',
    LOAD_DATA_EMPTY: 'Vui lòng nạp dữ liệu!',
    LOAD_DATA_SUCCESS: 'Nạp dữ liệu thành công!',
    NO_DATA_TO_DOWNLOAD: 'Chưa có dữ liệu!',
    DOWNLOAD_SUCCESS: 'Tải xuống thành công!',
    CACHE_CLEARED: 'Xóa thành công!'
};

// Storage utilities
const StorageUtil = {
    getTaxCodes() {
        const data = localStorage.getItem(STORAGE_KEYS.TAX_CODES);
        return data ? data.split(',').filter(code => code.trim()) : [];
    },

    setTaxCodes(codes) {
        localStorage.setItem(STORAGE_KEYS.TAX_CODES, codes.join(','));
    },

    getMetaData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.META_PANIC) || '[]');
    },

    setMetaData(data) {
        localStorage.setItem(STORAGE_KEYS.META_PANIC, JSON.stringify(data));
    },

    clear() {
        localStorage.clear();
    }
};

// Toast utility
const ToastUtil = {
    show(message, duration = 3000) {
        Toastify({ text: message, duration }).showToast();
    },

    success(message) {
        this.show(message);
    },

    error(message) {
        this.show(message);
    }
};

// DOM utilities
const DOMUtil = {
    querySelector(selector) {
        return document.querySelector(selector);
    },

    createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.textContent) element.textContent = options.textContent;
        if (options.classes) element.classList.add(...options.classes);
        if (options.id) element.id = options.id;
        if (options.type) element.type = options.type;
        if (options.styles) {
            Object.entries(options.styles).forEach(([prop, value]) => {
                element.style.setProperty(prop, value);
            });
        }

        return element;
    }
};

// Tax code management
class TaxCodeManager {
    constructor() {
        this.taxInput = DOMUtil.querySelector(SELECTORS.TAX_INPUT);
        this.captcha = DOMUtil.querySelector(SELECTORS.CAPTCHA);
        this.initEventListeners();
    }

    initEventListeners() {
        if (this.captcha) {
            this.captcha.addEventListener('keydown', (e) => this.handleCaptchaEnter(e));
        }
    }

    handleCaptchaEnter(e) {
        if (e.key === 'Enter') {
            if (!this.taxInput?.value) {
                ToastUtil.error(MESSAGES.EMPTY_TAX_CODE);
                return;
            }

            const submitBtn = DOMUtil.querySelector(SELECTORS.SUBMIT_BTN);
            if (submitBtn) {
                submitBtn.click();
                ToastUtil.success(MESSAGES.TAX_CODE_SUCCESS.replace('{taxCode}', this.taxInput.value));
            }
        }
    }

    nextTax() {
        const taxCodes = StorageUtil.getTaxCodes();

        if (taxCodes.length === 0) return;

        // Remove current tax code and get next one
        const filteredCodes = taxCodes.filter(code => code !== this.taxInput?.value);
        StorageUtil.setTaxCodes(filteredCodes);

        // Load next tax code
        if (filteredCodes.length > 0 && this.taxInput) {
            this.taxInput.value = filteredCodes[0];
        }

        // Update tax codes display
        const taxCodesElement = DOMUtil.querySelector(SELECTORS.TAX_CODES);
        if (taxCodesElement) {
            taxCodesElement.value = filteredCodes.join(',');
        }
    }

    loadInitialTaxCode() {
        if (!this.taxInput) return;

        const taxCodes = StorageUtil.getTaxCodes();
        if (taxCodes.length > 0) {
            this.taxInput.value = taxCodes[0];
        }
    }
}

// UI Management
class UIManager {
    constructor(taxCodeManager) {
        this.taxCodeManager = taxCodeManager;
    }

    createTaxCodesInput() {
        if (DOMUtil.querySelector(SELECTORS.TAX_CODES)) return;

        const container = DOMUtil.createElement('div', { classes: ['tax_codes'] });
        const input = DOMUtil.createElement('textarea', {
            id: 'taxCodes'
        });

        const existingData = StorageUtil.getTaxCodes();
        if (existingData.length > 0) {
            input.value = existingData.join(',');
        }

        const loadButton = DOMUtil.createElement('button', {
            textContent: 'Nạp dữ liệu',
            classes: ['btn']
        });

        loadButton.addEventListener('click', () => this.handleLoadTaxCodes(input));

        container.appendChild(input);
        container.appendChild(loadButton);
        document.body.appendChild(container);
    }

    handleLoadTaxCodes(input) {
        if (!input.value) {
            ToastUtil.error(MESSAGES.LOAD_DATA_EMPTY);
            return;
        }

        const taxCodes = input.value.split('\n').filter(code => code.trim());
        StorageUtil.setTaxCodes(taxCodes);

        if (this.taxCodeManager.taxInput && taxCodes.length > 0) {
            this.taxCodeManager.taxInput.value = taxCodes[0];
        }

        input.value = taxCodes.join(',');
        ToastUtil.success(MESSAGES.LOAD_DATA_SUCCESS);
    }

    createDownloadButtons() {
        const form = DOMUtil.querySelector(SELECTORS.FORM);
        if (!form) return;

        const container = DOMUtil.createElement('div', {
            styles: {
                display: 'flex',
                gap: '1rem',
                'justify-content': 'center',
                'margin-top': '1rem'
            }
        });

        const downloadBtn = this.createStyledButton('Download', () => this.handleDownload());
        const clearBtn = this.createStyledButton('Xóa cache', () => this.handleClearCache());

        container.appendChild(downloadBtn);
        container.appendChild(clearBtn);
        form.appendChild(container);
    }

    createStyledButton(text, clickHandler) {
        const button = DOMUtil.createElement('button', {
            textContent: text,
            type: 'button',
            styles: {
                background: '#c4141b',
                color: 'white',
                cursor: 'pointer',
                border: '0',
                padding: '0.5rem 1rem',
                display: 'block',
                width: '100%'
            }
        });

        button.addEventListener('click', clickHandler);
        return button;
    }

    handleDownload() {
        const data = StorageUtil.getMetaData();
        if (data.length === 0) {
            ToastUtil.error(MESSAGES.NO_DATA_TO_DOWNLOAD);
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "People");
        XLSX.writeFile(wb, CONFIG.EXCEL_FILENAME);
        ToastUtil.success(MESSAGES.DOWNLOAD_SUCCESS);
    }

    handleClearCache() {
        StorageUtil.clear();
        ToastUtil.success(MESSAGES.CACHE_CLEARED);
    }
}

// Data Processing
class DataProcessor {
    constructor(taxCodeManager) {
        this.taxCodeManager = taxCodeManager;
    }

    processPage() {
        const taxInput = this.taxCodeManager.taxInput;
        if (!taxInput?.value) return;

        const table = DOMUtil.querySelector(SELECTORS.TABLE_SEARCH);
        if (!table) return;

        const titleElement = DOMUtil.querySelector(SELECTORS.TITLE);
        if (!titleElement) return;

        const title = titleElement.textContent.trim();

        if (title === TITLES.SEARCH_INFO) {
            setTimeout(() => this.processSearchResults(), 1000);
        }
    }

    processSearchResults() {
        const response = document.querySelectorAll('script')[7].textContent;

        if (!response) return;
        // Sử dụng Regular Expression để tìm và tách chuỗi JSON
        var jsonString = response.match(/{.*}/s)[0]; // match tìm chuỗi JSON trong JS
        var nntJson = JSON.parse(jsonString);
        const record = nntJson.DATA[0];
        if (!record) return;

        const data = StorageUtil.getMetaData();
        const taxInput = this.taxCodeManager.taxInput;

        const DKT_DIA_CHI = record.DKT_DIA_CHI.find(x => x.LOAI === 'XXDEFAULT');

        let item = {
            STT: data.length + 1,
            MST: taxInput.value,
            TEN_NNT: record.TEN_NNT || '',
            NGAY_BAT_DAU_KD: record.NGAY_BAT_DAU_KD || '',
            TEN_CQT_QLY: record.TEN_CQT_QLY || '',
            DIA_CHI: DKT_DIA_CHI.DIA_CHI + ', ' + DKT_DIA_CHI.PHUONG_XA + ', ' + DKT_DIA_CHI.TINH_TP,
            TEN_TRANG_THAI: record.TEN_TRANG_THAI || '',
            TEN_CHU_DN: record.TEN_CHU_DN || '',
            CCCD: record.BU_OWNER[0].IDNUMBER || '',
            NGAY_SINH: record.BU_OWNER[0].NGAY_SINH || '',
            TEN_LOAI_NNT: record.TEN_LOAI_NNT || ''
        };

        data.push(item);
        StorageUtil.setMetaData(data);

        this.taxCodeManager.nextTax();
    }

    processDetailInfo(table) {
        const data = StorageUtil.getMetaData();
        const taxCode = table.rows[0]?.cells[1]?.textContent.trim();

        if (!taxCode) return;

        const index = data.findIndex(x => x.MST === taxCode);
        if (index !== -1) {
            data[index].Address = table.rows[3]?.cells[1]?.textContent.trim() || '';
            data[index].Director = table.rows[12]?.cells[1]?.textContent.trim() || '';
            data[index].FoundationDate = table.rows[9]?.cells[1]?.textContent.trim() || '';
            data[index].Department = table.rows[2]?.cells[1]?.textContent.trim() || '';
            StorageUtil.setMetaData(data);
        }

        this.taxCodeManager.nextTax();
    }
}

// Main Application
class TaxCodeApp {
    constructor() {
        this.taxCodeManager = new TaxCodeManager();
        this.uiManager = new UIManager(this.taxCodeManager);
        this.dataProcessor = new DataProcessor(this.taxCodeManager);
        this.init();
    }

    init() {
        this.loadExternalStyles();
        this.uiManager.createTaxCodesInput();
        this.uiManager.createDownloadButtons();
        this.taxCodeManager.loadInitialTaxCode();
        this.dataProcessor.processPage();
    }

    loadExternalStyles() {
        const cssId = 'tailwindCSS';
        if (!document.getElementById(cssId)) {
            const head = document.getElementsByTagName('head')[0];
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = CONFIG.TAILWIND_CSS_URL;
            head.appendChild(link);
        }
    }
}

new TaxCodeApp();