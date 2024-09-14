AOS.init();


const nav = document.querySelector("nav");
nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
        nav.querySelectorAll("a").forEach(a => {
            const was_selected = a.querySelector("li").classList.contains("selected");
            if (was_selected) a.querySelector("li").classList.remove("selected");
        });
        a.querySelector("li").classList.add("selected");
    });
});

document.querySelectorAll(".use-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        setTimeout(() => {
            link_setter();
        }, 200);
    });
});

function link_setter() {
    const url = window.location.href;
    const is_selected = url.includes("#");
    if (is_selected) {
        nav.querySelectorAll("a").forEach(a => {
            if (a.href === url) a.click();
        });
    } else {
        nav.querySelector("a").click();
    }
}

link_setter();








const randomBtn = document.getElementById("random-btn");

const deskCount = document.getElementById("desk-count");
let colCount = deskCount.value === "12" ? 4 : 6;

const deskContainer = document.querySelector(".desk-container");

randomBtn.addEventListener("click", () => {
    const desks = deskContainer.querySelectorAll(".desk");
    const is_filled = checkDeskNames(desks);
    if (is_filled) {
        const new_desks = shuffleDesk([...desks]);
        deskContainer.querySelectorAll(".desks").forEach(desk => desk.remove());
        new_desks.forEach(desk => deskContainer.appendChild(desk));
        saveData();
    } else {
        alert("名前の入力されていない席があるようです。\n全ての席に名前を入力して始めてください。");
    }
});

function shuffleDesk(desks)
{
    for (let i = desks.length - 1; i > 0; i --) {
        const j = Math.floor(Math.random() * (i + 1));
        [desks[i], desks[j]] = [desks[j], desks[i]];
    }
    return desks;
}

function checkDeskNames(desks) {
    let is_filled = true;
    desks.forEach(desk => {
        const is_empty = desk.querySelector("input").value.trim() === "";
        if (is_empty) is_filled = false;
    });
    return is_filled;
}

deskCount.addEventListener("change", () => setDesk());
setDeskDataInputs();

function setDeskDataInputs()
{
    const lastViewData = JSON.parse(localStorage.getItem("last-view-data"));
    if (lastViewData) {
        deskCount.value = lastViewData[0];
        colCount = lastViewData[0] === "12" ? 4 : 6;
    }
}

function setDesk() {
    parseInt(deskCount.value) <= 12 ? deskCount.value = 12 : deskCount.value = 24;
    const desk_count = deskCount.value;
    colCount = deskCount.value === "12" ? 4 : 6;

    saveLastViewData(desk_count, colCount);

    deskContainer.style.gap = `calc(100% / ${colCount} / ${parseInt(colCount) * 2})`;
    desk_side = `calc(100% / ${colCount}.5)`;

    deskContainer.querySelectorAll(".desk").forEach(desk => desk.remove());

    const classes = JSON.parse(localStorage.getItem("classes"));
    let room = [];
    if (classes) {
        classes.forEach(classroom => {
            if (classroom[0] === parseInt(desk_count)) {
                room = classroom;
            }
        });
    }

    for (let i = 0; i < desk_count; i++) {
        const desk = document.createElement("div");
        desk.className = "desk";
        const deskName = document.createElement("input");
        deskName.type = "text";
        deskName.className = "desk-name";
        deskName.autocomplete = "off";
        deskName.placeholder = "ここに名前を入力";
        desk.addEventListener("change", () => saveData());

        if (room.length > 0) deskName.value = room[i + 1];

        desk.style.width = desk.style.height = desk_side;
        desk.appendChild(deskName);

        deskContainer.appendChild(desk);
    }
}

function saveLastViewData(desk_count)
{
    localStorage.setItem("last-view-data", JSON.stringify([desk_count]));
}


setDesk();

function saveData() {
    let save_data = [];

    const desks = deskContainer.querySelectorAll(".desk");
    const desk_count = desks.length;
    let room = [];
    room.push(desk_count);
    desks.forEach(desk => {
        room.push(desk.querySelector("input").value.trim());
    });
    const classes = JSON.parse(localStorage.getItem("classes"));
    if (classes) {
        classes.forEach(room => {
            if (room[0] !== desk_count) save_data.push(room);
        });
    }
    save_data.push(room);

    localStorage.setItem("classes", JSON.stringify(save_data));
}

const downLoadBtn = document.getElementById("btn-download");
const importBtn = document.getElementById("btn-import");
const fileSelector = document.getElementById("file-import");

downLoadBtn.addEventListener("click", () => {
    const classes = JSON.parse(localStorage.getItem("classes"));
    if (classes) {
        const jsonString = JSON.stringify(classes, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "desk_data.json";
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert("まだ席のデータがないようです。\n席のデータを入力してからダウンロードしてください。");
    }
});

importBtn.addEventListener("click", () => {
    fileSelector.click();
});

fileSelector.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                localStorage.setItem("classes", JSON.stringify(importedData));
                alert("データのインポートが完了しました。");
                setDesk();
            } catch (error) {
                alert("データの読み込みに失敗しました。\n有効なJSONファイルであることを確認してください。");
            }
        };
        reader.readAsText(file);
    }
});

