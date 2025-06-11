const { Client, Storage, ID, Permission, Role } = Appwrite;

const client = new Appwrite.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('682e2d160029e5107ad0');

const storage = new Appwrite.Storage(client);
const bucketId = '682e2ef40025e30d04b7';
const projectId = '682e2d160029e5107ad0';

async function loadGallery() {
  try {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    let allFiles = [];
    let nextCursor = undefined;

    while (true) {
      const queries = [
        Appwrite.Query.limit(100),
        ...(nextCursor ? [Appwrite.Query.cursorAfter(nextCursor)] : [])
      ];

      const result = await storage.listFiles(
        bucketId,
        queries
      );

      allFiles.push(...result.files);
      nextCursor = result.nextCursor;

      console.log("File dalam batch ini:", result.files.length);
      console.log("Cursor berikutnya:", nextCursor);

      allFiles.forEach(file => {
      const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${file.$id}/view?project=682e2d160029e5107ad0`;
      gallery.innerHTML += `
        <div class="item">
          <img src="${imageUrl}" alt="${file.name}">
        </div>
      `;
    });
    
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.querySelector(".close");
    const downloadLink = document.querySelector(".download");

    // Modal klik gambar
    gallery.addEventListener("click", e => {
      if (e.target.tagName === "IMG") {
        modal.style.display = "block";
        modalImg.src = e.target.src;
        document.body.classList.add("no-scroll");

        window.history.pushState({ modalOpen: true }, "", "#modal");

        const src = e.target.src;
      const match = src.match(/\/files\/(.*?)\/view/);

      if (match && match[1]) {
      const fileId = match[1];

      // Cari nama file dari allFiles
      const fileObj = allFiles.find(f => f.$id === fileId);
      const fileName = fileObj ? fileObj.name : 'downloaded_file';

      // Bersihkan event listener sebelumnya
      downloadLink.onclick = null;

      // Pasang event listener baru
      downloadLink.onclick = (ev) => {
        ev.preventDefault();
        downloadFile(fileId, fileName);
      };
    } else {
      downloadLink.onclick = null;
      downloadLink.href = '#';
    }
          }
        });

        window.addEventListener('popstate', (event) => {
        if (modal.style.display === "block") {
          modal.style.display = "none";
          document.body.classList.remove("no-scroll");
        }
        });

   

    closeBtn.onclick = () => {
      modal.style.display = "none";
      document.body.classList.remove("no-scroll");

      if(window.location.hash === "#modal") {
      window.history.back();
  }
    };

      if (!result.nextCursor) break;
    }

    console.log("Total file:", allFiles.length);
    
    // Render gambar...
  } catch (err) {
    console.error("Gagal load gallery:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadGallery();

    const fileInput = document.getElementById('uploader');
    const fileName = document.getElementById('file-name');

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = "Tidak ada file yang dipilih";
        }
    });

    document.getElementById('upload-button').addEventListener('click', async () => {
        const fileInput = document.getElementById('uploader');
        const file = fileInput.files[0];
        const alertDialog = document.getElementById('alert');
        
        if (!file) {
            alertDialog.style.left = '20px';
             setTimeout(() => {
              alertDialog.style.left = '-320px';
              }, 3000);
            // alert('Pilih file terlebih dahulu!');
            return;
        }

        const succes = document.getElementById('alertSucces');
        const err = document.getElementById('alertError');
        try {
            const response = await storage.createFile(
                '682e2ef40025e30d04b7',
                ID.unique(),
                file
            );
            console.log('Upload sukses:', response);
            succes.style.left = '20px';
             setTimeout(() => {
              succes.style.left = '-320px';
              }, 3000);
              const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/682e2ef40025e30d04b7/files/${response.$id}/view?project=682e2d160029e5107ad0`;

              const item = document.createElement('div');
              item.classList.add('item');
              item.innerHTML = `<img src="${imageUrl}" alt="${file.name}">`;
              gallery.prepend(item);
              // alert('Upload sukses!');
        } catch (error) {
            console.error('Upload gagal:', error);
            err.style.left = '20px';
             setTimeout(() => {
              err.style.left = '-320px';
              }, 3000);
            // alert('Upload gagal!');
        }
    });
  });