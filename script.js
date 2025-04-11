
        //1
       document.addEventListener('DOMContentLoaded', () => {
        //2
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const previewGrid = document.getElementById('previewGrid');
            const previewModal = document.getElementById('previewModal');
            const modalOverlay = document.getElementById('modalOverlay');
            const closeModal = document.getElementById('closeModal');
            const previewContent = document.getElementById('previewContent');
        //3
            let filesArray = [];
        //4
            const fileTypes = {
                'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
                'video': ['mp4', 'webm', 'ogg'],
                'audio': ['mp3', 'wav', 'ogg'],
                'pdf': ['pdf'],
                'text': ['txt', 'md', 'json', 'js', 'css', 'html', 'xml', 'csv'],
                'code': ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'swift', 'go'],
                'document': ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
                'archive': ['zip', 'rar', '7z', 'tar', 'gz']
            };
        //5
            async function createThumbnail(file) {
                const extension = file.name.split('.').pop().toLowerCase();
                let thumbnailContent = '';
        //6
                if (file.type.startsWith('image/')) {
                    const dataUrl = await readFileAsDataURL(file);
                    thumbnailContent = `<img src="${dataUrl}" alt="${file.name}">`;
                }
                else if (file.type.startsWith('video/')) {
                    const dataUrl = await readFileAsDataURL(file);
                    thumbnailContent = `
                        <video>
                            <source src="${dataUrl}" type="${file.type}">
                        </video>
                    `;
                }
                else if (file.type.startsWith('audio/')) {
                    thumbnailContent = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18V5l12-2v13"/>
                                <circle cx="6" cy="18" r="3"/>
                                <circle cx="18" cy="16" r="3"/>
                            </svg>
                        </div>
                    `;
                }
                else if (file.type.startsWith('text/') || fileTypes.code.includes(extension)) {
                    const content = await readFileAsText(file);
                    thumbnailContent = `<pre>${escapeHtml(content.substring(0, 200))}${content.length > 200 ? '...' : ''}</pre>`;
                }
                else {
                    thumbnailContent = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                            ${getFileIcon(extension)}
                        </div>
                    `;
                }

                return thumbnailContent;
            }

            function showSuccessMessage() {
                const message = document.createElement('div');
                message.className = 'success-message';
                message.textContent = '✨ Files uploaded successfully!';
                document.body.appendChild(message);

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                setTimeout(() => {
                    message.style.animation = 'slideIn 0.5s reverse';
                    setTimeout(() => message.remove(), 500);
                }, 3000);
            }

            function getFileIcon(fileType) {
                const extension = fileType.split('/')[1] || fileType;
                if (fileTypes.image.includes(extension)) return '🖼️';
                if (fileTypes.video.includes(extension)) return '🎥';
                if (fileTypes.audio.includes(extension)) return '🎵';
                if (fileTypes.pdf.includes(extension)) return '📄';
                if (fileTypes.text.includes(extension)) return '📝';
                if (fileTypes.code.includes(extension)) return '👨‍💻';
                if (fileTypes.document.includes(extension)) return '📑';
                if (fileTypes.archive.includes(extension)) return '🗄️';
                return '📁';
            }

            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
          //7
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragging');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragging');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragging');
                handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', () => handleFiles(fileInput.files));
          //8
            async function handleFiles(files) {
                filesArray = Array.from(files);
                previewGrid.innerHTML = '';

                for (let i = 0; i < filesArray.length; i++) {
                    const file = filesArray[i];
                    const extension = file.name.split('.').pop().toLowerCase();
                    
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.style.animationDelay = `${i * 0.1}s`;

                    const thumbnail = document.createElement('div');
                    thumbnail.className = 'preview-thumbnail';
                    thumbnail.innerHTML = await createThumbnail(file);

                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info';
                    fileInfo.innerHTML = `
                        <p><strong>${file.name}</strong></p>
                        <p>${formatFileSize(file.size)}</p>
                    `;

                    const typeBadge = document.createElement('div');
                    typeBadge.className = 'file-type-badge';
                    typeBadge.textContent = extension.toUpperCase();

                    const actions = document.createElement('div');
                    actions.className = 'preview-actions';
                    actions.innerHTML = `
                        <button class="preview-action-btn primary">Preview</button>
                    `;
            //9
                    previewItem.appendChild(thumbnail);
                    previewItem.appendChild(fileInfo);
                    previewItem.appendChild(typeBadge);
                    previewItem.appendChild(actions);

                    previewItem.querySelector('.preview-action-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        showFilePreview(file);
                    });

                    previewGrid.appendChild(previewItem);
                }

                showSuccessMessage();
            }

            async function showFilePreview(file) {
                modalOverlay.classList.add('active');
                previewModal.classList.add('active');
                
                previewContent.innerHTML = '<div class="loading"></div>';
                
                const extension = file.name.split('.').pop().toLowerCase();
                const fileInfo = `
                    <div class="file-info">
                        <p><strong>File Name:</strong> ${file.name}</p>
                        <p><strong>File Type:</strong> ${file.type || 'Unknown'}</p>
                        <p><strong>File Size:</strong> ${formatFileSize(file.size)}</p>
                        <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
                    </div>
                `;

                try {
                    if (file.type.startsWith('image/')) {
                        const dataUrl = await readFileAsDataURL(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <img src="${dataUrl}" alt="${file.name}">
                        `;
                    } 
                    else if (file.type.startsWith('video/')) {
                        const dataUrl = await readFileAsDataURL(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <video controls>
                                <source src="${dataUrl}" type="${file.type}">
                                Your browser does not support the video tag.
                            </video>
                        `;
                    }
                    else if (file.type.startsWith('audio/')) {
                        const dataUrl = await readFileAsDataURL(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <audio controls>
                                <source src="${dataUrl}" type="${file.type}">
                                Your browser does not support the audio tag.
                            </audio>
                        `;
                    }
                    else if (file.type === 'application/pdf') {
                        const dataUrl = await readFileAsDataURL(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <iframe class="pdf-preview" src="${dataUrl}"></iframe>
                        `;
                    }
                    else if (file.type.startsWith('text/') || fileTypes.code.includes(extension)) {
                        const content = await readFileAsText(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <pre>${escapeHtml(content)}</pre>
                        `;
                    }
                    else {
                        const downloadUrl = URL.createObjectURL(file);
                        previewContent.innerHTML = `
                            ${fileInfo}
                            <div class="preview-error">
                                <p>Preview not available for this file type</p>
                            </div>
                            <div class="preview-actions">
                                <a href="${downloadUrl}" download="${file.name}" class="preview-action-btn primary">
                                    Download File
                                </a>
                            </div>
                        `;
                    }
                } catch (error) {
                    previewContent.innerHTML = `
                        ${fileInfo}
                        <div class="preview-error">
                            <p>Error previewing file: ${error.message}</p>
                        </div>
                    `;
                }
            }

            function readFileAsDataURL(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });
            }

            function readFileAsText(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsText(file);
                });
            }

            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
        //10
            function closePreviewModal() {
                modalOverlay.classList.remove('active');
                previewModal.classList.remove('active');
                previewContent.innerHTML = '';
            }

            closeModal.addEventListener('click', closePreviewModal);
            modalOverlay.addEventListener('click', closePreviewModal);
        });

        function updateFormAction() {
            const recipient = document.getElementById("recipient").value;
            const form = document.getElementById("contactForm");

            const formActions = {
                "Sk. Azeeza Farhana": "https://formspree.io/f/xgvaalze",
                "B. Samhitha": "https://formspree.io/f/mdkedoww",
                "Ch. Sumiya": "https://formspree.io/f/mdkedoww",
                "K. Divya": "https://formspree.io/f/mdkedoww",
                "Ch. Pavani": "https://formspree.io/f/xanebyll",
                "B. Jagadeeswari": "https://formspree.io/f/mdkedoww"
            };

            form.action = formActions[recipient] || "#"; // Default to "#" if no recipient is selected
        }

        const canvas = document.createElement('canvas');
        canvas.id = 'bgCanvas';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const dots = [];
        for (let i = 0; i < 60; i++) {
          dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 1.5,  
            dy: (Math.random() - 0.5) * 1.5,  
            alpha: Math.random() * 0.5 + 0.5
          });
        }
        
        function drawDots() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${dot.alpha})`;
            ctx.fill();
        
            // Update position
            dot.x += dot.dx;
            dot.y += dot.dy;
        
            // Bounce off edges
            if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
            if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;
          });
          requestAnimationFrame(drawDots);
        }
        
        drawDots();
        