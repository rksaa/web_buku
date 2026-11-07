// ===== BAGIAN 1: FUNGSI BANTU =====
function $(id) {
    return document.getElementById(id);
}

function getPengguna() {
    var baru = JSON.parse(localStorage.getItem("penggunaBaru")) || [];
    return dataPengguna.concat(baru);
}

function bukaModal(id) {
    $(id).classList.add("show");
}

function tutupModal(id) {
    $(id).classList.remove("show");
}

function cekLogin() {
    var user = JSON.parse(sessionStorage.getItem("userLogin"));
    if (!user) {
        window.location.href = "index.html";
    }
    return user;
}

function logout() {
    sessionStorage.removeItem("userLogin");
    window.location.href = "index.html";
}

function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
}

function angkaDariHarga(teks) {
    return parseInt(teks.replace(/[^0-9]/g, ""));
}
// ===== BAGIAN 2: HALAMAN LOGIN =====
function initLogin() {
    // --- Login ---
    $("formLogin").addEventListener("submit", function (e) {
        e.preventDefault();
        var email = $("email").value.trim();
        var password = $("password").value;

        if (email === "" || password === "") {
            $("pesanLogin").textContent = "Email dan password wajib diisi.";
            return;
        }

        var user = getPengguna().find(function (u) {
            return u.email === email && u.password === password;
        });

        if (user) {
            sessionStorage.setItem("userLogin", JSON.stringify(user));
            window.location.href = "dashboard.html";
        } else {
            $("pesanLogin").textContent = "";
            alert("Email/password yang anda masukkan salah");
        }
    });

    // --- Buka & tutup modal ---
    $("btnLupa").onclick = function () { bukaModal("modalLupa"); };
    $("btnDaftar").onclick = function () { bukaModal("modalDaftar"); };
    $("tutupLupa").onclick = function () { tutupModal("modalLupa"); };
    $("tutupDaftar").onclick = function () { tutupModal("modalDaftar"); };

    // --- Lupa password ---
    $("formLupa").addEventListener("submit", function (e) {
        e.preventDefault();
        var email = $("emailLupa").value.trim();
        var ada = getPengguna().some(function (u) { return u.email === email; });

        if (ada) {
            alert("Link reset password sudah dikirim ke " + email);
            $("formLupa").reset();
            tutupModal("modalLupa");
        } else {
            alert("Email tidak terdaftar.");
        }
    });

    // --- Daftar ---
    $("formDaftar").addEventListener("submit", function (e) {
        e.preventDefault();
        var nama = $("namaDaftar").value.trim();
        var email = $("emailDaftar").value.trim();
        var pass = $("passDaftar").value;
        var konf = $("konfDaftar").value;
        var pesan = $("pesanDaftar");
        var polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (nama === "" || email === "" || pass === "") {
            pesan.textContent = "Semua kolom wajib diisi.";
        } else if (!polaEmail.test(email)) {
            pesan.textContent = "Format email tidak valid.";
        } else if (pass.length < 6) {
            pesan.textContent = "Password minimal 6 karakter.";
        } else if (pass !== konf) {
            pesan.textContent = "Konfirmasi password tidak sama.";
        } else if (getPengguna().some(function (u) { return u.email === email; })) {
            pesan.textContent = "Email sudah terdaftar.";
        } else {
            var baru = JSON.parse(localStorage.getItem("penggunaBaru")) || [];
            baru.push({ id: getPengguna().length + 1, nama: nama, email: email, password: pass, role: "User" });
            localStorage.setItem("penggunaBaru", JSON.stringify(baru));
            alert("Pendaftaran berhasil. Silakan login.");
            pesan.textContent = "";
            $("formDaftar").reset();
            tutupModal("modalDaftar");
        }
    });
}
// ===== BAGIAN 3: HALAMAN DASHBOARD =====
function initDashboard() {
    var user = cekLogin();

    // Greeting berdasarkan jam lokal
    var jam = new Date().getHours();
    var sapaan = "Selamat malam";
    if (jam < 11) {
        sapaan = "Selamat pagi";
    } else if (jam < 15) {
        sapaan = "Selamat siang";
    } else if (jam < 18) {
        sapaan = "Selamat sore";
    }
    $("greeting").textContent = sapaan + ", " + user.nama + " (" + user.role + ")";

    // History transaksi (modal)
    $("btnHistory").onclick = function () {
        var riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
        var daftar = $("isiHistory");
        daftar.innerHTML = "";

        if (riwayat.length === 0) {
            var kosong = document.createElement("li");
            kosong.textContent = "Belum ada transaksi.";
            daftar.appendChild(kosong);
        }
        riwayat.forEach(function (r) {
            var li = document.createElement("li");
            li.textContent = r.nomorDO + " - " + r.nama + " - " + r.tanggal + " - " + formatRupiah(r.total) + " (" + r.metode + ")";
            daftar.appendChild(li);
        });
        bukaModal("modalHistory");
    };
    $("tutupHistory").onclick = function () { tutupModal("modalHistory"); };
}
// ===== BAGIAN 4: HALAMAN STOK / KATALOG =====
function buatBaris(b) {
    var tr = document.createElement("tr");

    var tdCover = document.createElement("td");
    if (b.cover) {
        var img = document.createElement("img");
        img.src = b.cover;
        img.alt = b.namaBarang;
        tdCover.appendChild(img);
    } else {
        tdCover.textContent = "-";
    }
    tr.appendChild(tdCover);

    [b.kodeBarang, b.namaBarang, b.jenisBarang, b.edisi, b.stok, b.harga].forEach(function (isi) {
        var td = document.createElement("td");
        td.textContent = isi;
        tr.appendChild(td);
    });
    return tr;
}

function initStok() {
    cekLogin();
    var tbody = $("isiTabel");

    // Tampilkan data dari data.js
    dataKatalogBuku.forEach(function (b) {
        tbody.appendChild(buatBaris(b));
    });

    // Tambah baris stok baru
    $("formStok").addEventListener("submit", function (e) {
        e.preventDefault();
        var kode = $("kode").value.trim();
        var nama = $("nama").value.trim();
        var jenis = $("jenis").value.trim();
        var edisi = $("edisi").value;
        var stok = $("stok").value;
        var harga = $("harga").value;
        var pesan = $("pesanStok");

        if (kode === "" || nama === "" || jenis === "" || edisi === "" || stok === "" || harga === "") {
            pesan.textContent = "Semua kolom wajib diisi.";
            return;
        }
        if (parseInt(stok) < 0 || parseInt(harga) <= 0) {
            pesan.textContent = "Stok tidak boleh minus dan harga harus lebih dari 0.";
            return;
        }
        var kembar = dataKatalogBuku.some(function (b) { return b.kodeBarang === kode; });
        if (kembar) {
            pesan.textContent = "Kode barang sudah ada.";
            return;
        }

        var bukuBaru = {
            kodeBarang: kode,
            namaBarang: nama,
            jenisBarang: jenis,
            edisi: edisi,
            stok: parseInt(stok),
            harga: formatRupiah(parseInt(harga)),
            cover: ""
        };
        dataKatalogBuku.push(bukuBaru);
        tbody.appendChild(buatBaris(bukuBaru));

        pesan.textContent = "";
        $("formStok").reset();
        $("jenis").value = "Buku Ajar";
        alert("Stok baru berhasil ditambahkan.");
    });
}
// ===== BAGIAN 5: HALAMAN PEMESANAN =====
var keranjang = [];

function renderKeranjang() {
    var tbody = $("isiKeranjang");
    tbody.innerHTML = "";
    var total = 0;

    if (keranjang.length === 0) {
        var trKosong = document.createElement("tr");
        var tdKosong = document.createElement("td");
        tdKosong.colSpan = 5;
        tdKosong.textContent = "Belum ada buku dipilih.";
        trKosong.appendChild(tdKosong);
        tbody.appendChild(trKosong);
    }

    keranjang.forEach(function (item, i) {
        var subtotal = item.harga * item.jumlah;
        total += subtotal;
        var tr = document.createElement("tr");

        var tdNama = document.createElement("td");
        tdNama.textContent = item.nama;
        var tdHarga = document.createElement("td");
        tdHarga.textContent = formatRupiah(item.harga);

        // Kolom jumlah: bisa diubah langsung
        var tdJumlah = document.createElement("td");
        var input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.value = item.jumlah;
        input.addEventListener("change", function () {
            var j = parseInt(input.value);
            if (isNaN(j) || j < 1) {
                alert("Jumlah minimal 1.");
                input.value = item.jumlah;
            } else if (j > item.stok) {
                alert("Jumlah melebihi stok (" + item.stok + ").");
                input.value = item.jumlah;
            } else {
                item.jumlah = j;
                renderKeranjang();
            }
        });
        tdJumlah.appendChild(input);

        var tdSub = document.createElement("td");
        tdSub.textContent = formatRupiah(subtotal);

        var tdAksi = document.createElement("td");
        var btnHapus = document.createElement("button");
        btnHapus.type = "button";
        btnHapus.className = "secondary";
        btnHapus.textContent = "Hapus";
        btnHapus.style.marginTop = "0";
        btnHapus.onclick = function () {
            keranjang.splice(i, 1);
            renderKeranjang();
        };
        tdAksi.appendChild(btnHapus);

        [tdNama, tdHarga, tdJumlah, tdSub, tdAksi].forEach(function (td) { tr.appendChild(td); });
        tbody.appendChild(tr);
    });

    $("totalBayar").textContent = formatRupiah(total);
}

function initCheckout() {
    var user = cekLogin();
    $("namaPemesan").value = user.nama;
    $("emailPemesan").value = user.email;

    // Isi pilihan buku dari data.js
    var pilih = $("pilihBuku");
    dataKatalogBuku.forEach(function (b, i) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.textContent = b.namaBarang + " - " + b.harga;
        pilih.appendChild(opt);
    });

    renderKeranjang();

    // Tambah ke pesanan
    $("btnTambah").onclick = function () {
        var buku = dataKatalogBuku[pilih.value];
        var jumlah = parseInt($("jumlah").value);

        if (isNaN(jumlah) || jumlah < 1) {
            alert("Jumlah minimal 1.");
            return;
        }
        var ada = keranjang.find(function (k) { return k.kode === buku.kodeBarang; });
        var jumlahBaru = jumlah + (ada ? ada.jumlah : 0);
        if (jumlahBaru > buku.stok) {
            alert("Jumlah melebihi stok (" + buku.stok + ").");
            return;
        }

        if (ada) {
            ada.jumlah = jumlahBaru;
        } else {
            keranjang.push({
                kode: buku.kodeBarang,
                nama: buku.namaBarang,
                harga: angkaDariHarga(buku.harga),
                stok: buku.stok,
                jumlah: jumlah
            });
        }
        $("jumlah").value = 1;
        renderKeranjang();
    };

    // Kirim pesanan
    $("formPesan").addEventListener("submit", function (e) {
        e.preventDefault();
        var nama = $("namaPemesan").value.trim();
        var email = $("emailPemesan").value.trim();
        var telp = $("telp").value.trim();
        var alamat = $("alamat").value.trim();
        var metode = $("metode").value;
        var pesan = $("pesanCheckout");

        if (keranjang.length === 0) {
            pesan.textContent = "Pilih minimal satu buku terlebih dahulu.";
        } else if (nama === "" || email === "" || telp === "" || alamat === "" || metode === "") {
            pesan.textContent = "Semua data pemesan dan pembayaran wajib diisi.";
        } else if (!/^[0-9]{10,13}$/.test(telp)) {
            pesan.textContent = "No. telepon harus berupa angka 10-13 digit.";
        } else {
            var total = keranjang.reduce(function (t, k) { return t + k.harga * k.jumlah; }, 0);
            var nomorDO = "2026" + Math.floor(1000 + Math.random() * 9000);

            var riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
            riwayat.push({
                nomorDO: nomorDO,
                nama: nama,
                tanggal: new Date().toLocaleDateString("id-ID"),
                total: total,
                metode: metode
            });
            localStorage.setItem("riwayat", JSON.stringify(riwayat));

            alert("Pesanan berhasil dibuat.\nNomor DO: " + nomorDO + "\nTotal: " + formatRupiah(total));
            pesan.textContent = "";
            keranjang = [];
            renderKeranjang();
            $("telp").value = "";
            $("alamat").value = "";
            $("metode").value = "";
        }
    });
}
// ===== BAGIAN 6: HALAMAN TRACKING =====
// Pesanan baru dari checkout (tersimpan di localStorage) ikut bisa dilacak
function cariDiRiwayat(nomor) {
    var riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
    var r = riwayat.find(function (x) { return x.nomorDO === nomor; });
    if (!r) {
        return null;
    }
    return {
        nomorDO: r.nomorDO,
        nama: r.nama,
        status: "Diproses",
        ekspedisi: "JNE",
        tanggalKirim: r.tanggal,
        paket: "Reguler",
        total: formatRupiah(r.total),
        perjalanan: [
            { waktu: r.tanggal, keterangan: "Pesanan diterima dan sedang diproses" }
        ]
    };
}

function initTracking() {
    cekLogin();

    $("formCari").addEventListener("submit", function (e) {
        e.preventDefault();
        var nomor = $("nomorDO").value.trim();

        if (nomor === "") {
            alert("Nomor Delivery Order wajib diisi.");
            return;
        }

        var d = dataTracking[nomor] || cariDiRiwayat(nomor);
        if (!d) {
            $("hasil").hidden = true;
            alert("Nomor DO " + nomor + " tidak ditemukan.");
            return;
        }

        $("tNama").textContent = d.nama;
        $("tStatus").textContent = d.status;
        $("tEkspedisi").textContent = d.ekspedisi;
        $("tTanggal").textContent = d.tanggalKirim;
        $("tPaket").textContent = d.paket;
        $("tTotal").textContent = d.total;

        // Progress bar berdasarkan status
        var persen = { "Diproses": 20, "Dalam Perjalanan": 60, "Dikirim": 100 };
        $("tBar").style.width = (persen[d.status] || 30) + "%";

        // Riwayat perjalanan
        var daftar = $("tPerjalanan");
        daftar.innerHTML = "";
        d.perjalanan.forEach(function (p) {
            var li = document.createElement("li");
            li.textContent = p.keterangan;
            var waktu = document.createElement("small");
            waktu.textContent = p.waktu;
            li.appendChild(waktu);
            daftar.appendChild(li);
        });

        $("hasil").hidden = false;
    });
}
// ===== BAGIAN 7: PENGHUBUNG (taruh paling bawah) =====
document.addEventListener("DOMContentLoaded", function () {
    var halaman = document.body.dataset.page;

    var btnLogout = $("btnLogout");
    if (btnLogout) {
        btnLogout.onclick = function (e) {
            e.preventDefault();
            logout();
        };
    }

    if (halaman === "login") initLogin();
    if (halaman === "dashboard") initDashboard();
    if (halaman === "stok") initStok();
    if (halaman === "checkout") initCheckout();
    if (halaman === "tracking") initTracking();
});
