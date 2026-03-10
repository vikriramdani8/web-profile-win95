document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Jam Taskbar
    const clock = document.getElementById('clock');
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // Jam '0' menjadi '12'
        minutes = minutes < 10 ? '0' + minutes : minutes; // Tambah nol di depan

        clock.textContent = `${hours}:${minutes} ${ampm}`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // 2. Interaksi Buka / Tutup Jendela dan Order (z-index)
    const icons = document.querySelectorAll('.icon');
    const closeBtns = document.querySelectorAll('.close-btn');
    const windows = document.querySelectorAll('.window');

    let zIndexCounter = 10;

    icons.forEach(icon => {
        // Dobel klik untuk buka (ala Windows)
        icon.addEventListener('dblclick', () => {
            openWindow(icon.getAttribute('data-target'));
        });

        // Single klik juga bisa untuk perangkat mobile/touch
        icon.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                openWindow(icon.getAttribute('data-target'));
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('hidden');
        });
    });

    // Membawa jendela ke paling depan saat diklik
    windows.forEach(win => {
        win.addEventListener('mousedown', () => bringToFront(win));
        win.addEventListener('touchstart', () => bringToFront(win));
    });

    function openWindow(id) {
        const win = document.getElementById(id);
        if (!win) return;

        win.classList.remove('hidden');
        bringToFront(win);

        // Pusatkan otomatis jika posisi belum di-set
        if (!win.style.left) {
            // Posisi acak sedikit biar gak bentrok tepat di tengah
            const randomOffset = Math.floor(Math.random() * 40) - 20;
            const rect = win.getBoundingClientRect();

            // Mencegah off-screen
            let nextLeft = (window.innerWidth / 2) - (rect.width / 2) + randomOffset;
            let nextTop = (window.innerHeight / 2) - (rect.height / 2) + randomOffset;

            win.style.left = nextLeft + 'px';
            win.style.top = nextTop + 'px';
        }
    }

    function bringToFront(win) {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
    }

    // 3. Sistem Drag and Drop untuk Jendela (Tittle bar)
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar-text'); // Drag hanya dari teks judul

        let isDragging = false;
        let startX, startY, initialX, initialY;

        titleBar.addEventListener('mousedown', dragStart);
        titleBar.addEventListener('touchstart', dragStart, { passive: true });

        function dragStart(e) {
            isDragging = true;
            bringToFront(win);

            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }

            initialX = win.offsetLeft;
            initialY = win.offsetTop;

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        }

        function dragMove(e) {
            if (!isDragging) return;
            e.preventDefault(); // Mencegah teks terpilih

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const dx = clientX - startX;
            const dy = clientY - startY;

            let nextX = initialX + dx;
            let nextY = initialY + dy;

            // Mencegah jendela keluar dari layar (terutama untuk mobile)
            const maxRight = window.innerWidth - win.offsetWidth;
            const maxBottom = window.innerHeight - 35; // 35 adalah tinggi taskbar

            if (nextX < 0) nextX = 0;
            if (nextX > maxRight) nextX = maxRight;
            if (nextY < 0) nextY = 0;
            if (nextY > maxBottom - 30) nextY = maxBottom - 30; // memastikan title bar tetap bisa diklik

            win.style.left = nextX + 'px';
            win.style.top = nextY + 'px';
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }
    });

    // 4. Interaksi Tombol Lainnya
    const closeShortcutBtns = document.querySelectorAll('.close-btn-shortcut');
    closeShortcutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('hidden');
        });
    });

    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            alert('Mail application not found.\n\n[Error Code: 0x800C013E]\n\nPlease contact via magic telepathy!');
        });
    }

    // 5. Start Menu Logika
    const startBtn = document.querySelector('.start-btn');
    const startMenu = document.getElementById('start-menu');
    const menuItems = document.querySelectorAll('.menu-item');

    // Toggle Start Menu saat Start Button diklik
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah klik menyebar ke document
        startMenu.classList.toggle('hidden');
        startBtn.classList.toggle('active'); // opsional styling pas aktif
    });

    // Menutup Start Menu jika mengklik sembarang tempat di luar
    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
            startMenu.classList.add('hidden');
            startBtn.classList.remove('active');
        }
    });

    // Interaksi item di dalam Start Menu
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetWindowId = item.getAttribute('data-target');

            if (targetWindowId) {
                // Jika itu menu buka jendela aplikasi
                openWindow(targetWindowId);
            } else if (item.id === 'menu-shutdown') {
                // Jika Shutdown ditekan
                alert("It is now safe to turn off your computer.");
                document.body.innerHTML = '<div style="background: black; height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center; color: #ff8c00; font-family: monospace; font-size: 20px;">It is now safe to turn off your computer.</div>';
            }

            // Tutup menu setelah klik item
            startMenu.classList.add('hidden');
            startBtn.classList.remove('active');
        });
    });
});
