class ThreeStage {
    constructor() {
        this.container = document.getElementById('game-container');

        // Default initial values
        this.coins = GAME_CONFIG.initialCoins;
        this.researchPoints = GAME_CONFIG.initialShards;
        this.multiplier = 1;
        this.clickPower = GAME_CONFIG.baseDamage;

        this.maxBlockHP = 40;
        this.currentBlockHP = 40;
        this.blockLevel = 1;

        this.blockTypes = [
            { name: "Pathala Sandstone", element: "Prithvi (Earth)", color: 0xD2B48C, metal: 0.1, rough: 0.8, transmission: 0.0, hp: 40, reward: 35 },
            { name: "Suryakanta Gem Deposit", element: "Jala (Water)", color: 0x33A1FD, metal: 0.2, rough: 0.1, transmission: 0.9, hp: 120, reward: 110 },
            { name: "Agni Magma Core", element: "Agni (Fire)", color: 0xFF4500, metal: 0.6, rough: 0.3, transmission: 0.4, hp: 300, reward: 320 },
            { name: "Vayu Storm Prism", element: "Vayu (Air)", color: 0x00FFCC, metal: 0.9, rough: 0.1, transmission: 0.8, hp: 750, reward: 850 },
            { name: "Akasha Cosmic Void", element: "Akasha (Ether)", color: 0x8A2BE2, metal: 0.95, rough: 0.05, transmission: 0.95, hp: 1800, reward: 2500 }
        ];

        this.initThree();
        this.setupLights();
        this.createHyperRealisticBlock();
        this.setupRaycasting();

        // Load saved game progress asynchronously on boot
        this.loadGameProgress().then(() => {
            this.animate();
        });
    }

    async loadGameProgress() {
        const saveData = await cgManager.loadData(GAME_CONFIG.storageKey);
        if (saveData) {
            this.coins = saveData.coins || this.coins;
            this.researchPoints = saveData.researchPoints || this.researchPoints;
            this.multiplier = saveData.multiplier || this.multiplier;
            this.clickPower = saveData.clickPower || this.clickPower;
            this.blockLevel = saveData.blockLevel || this.blockLevel;
            this.currentBlockHP = saveData.currentBlockHP || this.currentBlockHP;

            // Apply loaded block tier properties
            const activeBlock = this.blockTypes[(this.blockLevel - 1) % this.blockTypes.length];
            this.maxBlockHP = activeBlock.hp;
            if (this.currentBlockHP > this.maxBlockHP) this.currentBlockHP = this.maxBlockHP;

            this.material.color.setHex(activeBlock.color);
            this.material.metalness = activeBlock.metal;
            this.material.roughness = activeBlock.rough;
            this.material.transmission = activeBlock.transmission;

            document.getElementById('element-badge').innerText = `${activeBlock.element} Element`;
            document.getElementById('block-title').innerText = `${activeBlock.name} (Lv. ${this.blockLevel})`;

            this.updateHUD();
            console.log("Game progress successfully loaded!");
        }
    }

    saveGameProgress() {
        const saveData = {
            coins: this.coins,
            researchPoints: this.researchPoints,
            multiplier: this.multiplier,
            clickPower: this.clickPower,
            blockLevel: this.blockLevel,
            currentBlockHP: this.currentBlockHP
        };
        cgManager.saveData(GAME_CONFIG.storageKey, saveData);
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0A0C14);

        const width = this.container.clientWidth || (window.innerWidth * 0.65);
        const height = this.container.clientHeight || (window.innerHeight - 90);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.2, 6.2);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xFFD700, 2.2);
        dirLight.position.set(5, 8, 5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const rimLight = new THREE.DirectionalLight(0x7367F0, 1.5);
        rimLight.position.set(-5, -2, -4);
        this.scene.add(rimLight);
    }

    createHyperRealisticBlock() {
        this.blockGroup = new THREE.Group();

        const coreGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const b = this.blockTypes[0];

        this.material = new THREE.MeshPhysicalMaterial({
            color: b.color,
            metalness: b.metal,
            roughness: b.rough,
            transmission: b.transmission,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            ior: 1.5
        });

        this.coreMesh = new THREE.Mesh(coreGeo, this.material);
        this.blockGroup.add(this.coreMesh);

        const crystalGeo = new THREE.ConeGeometry(0.3, 1.2, 4);
        for (let i = 0; i < 6; i++) {
            const crystal = new THREE.Mesh(crystalGeo, this.material);
            const angle = (i * Math.PI) / 3;
            crystal.position.set(Math.cos(angle) * 1.3, (Math.random() - 0.5) * 1.0, Math.sin(angle) * 1.3);
            crystal.rotation.z = (Math.random() - 0.5) * 0.5;
            this.blockGroup.add(crystal);
        }

        this.scene.add(this.blockGroup);
    }

    setupRaycasting() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.coreMesh);

            if (intersects.length > 0) {
                this.hitBlock();
            }
        });
    }

    hitBlock() {
        const dmg = this.clickPower * this.multiplier;
        this.currentBlockHP -= dmg;
        if (this.currentBlockHP < 0) this.currentBlockHP = 0;

        this.updateHPUI();
        this.blockGroup.scale.set(1.15, 0.85, 1.15);

        if (this.currentBlockHP <= 0) {
            this.nextBlock();
        } else {
            // Save periodically on hits
            this.saveGameProgress();
        }
    }

    updateHPUI() {
        const hpRatio = this.currentBlockHP / this.maxBlockHP;
        document.getElementById('hp-bar-fill').style.width = `${hpRatio * 100}%`;
        document.getElementById('hp-text').innerText = `${Math.ceil(this.currentBlockHP)}/${this.maxBlockHP}`;
    }

    updateHUD() {
        document.getElementById('gold-val').innerText = this.coins;
        document.getElementById('research-val').innerText = this.researchPoints;
        this.updateHPUI();
    }

    nextBlock() {
        const b = this.blockTypes[(this.blockLevel - 1) % this.blockTypes.length];
        this.coins += b.reward;
        this.researchPoints += 8;
        this.updateHUD();

        this.blockLevel++;
        const next = this.blockTypes[(this.blockLevel - 1) % this.blockTypes.length];
        this.maxBlockHP = next.hp;
        this.currentBlockHP = next.hp;

        this.material.color.setHex(next.color);
        this.material.metalness = next.metal;
        this.material.roughness = next.rough;
        this.material.transmission = next.transmission;

        document.getElementById('element-badge').innerText = `${next.element} Element`;
        document.getElementById('block-title').innerText = `${next.name} (Lv. ${this.blockLevel})`;
        this.updateHPUI();

        // Trigger Cloud Save on block clearance
        this.saveGameProgress();

        if (this.blockLevel % 10 === 0) {
            cgManager.showMidgameAd(() => { });
        }
    }

    triggerVajraBolt() {
        const damage = 300 * this.multiplier;
        this.currentBlockHP -= damage;
        if (this.currentBlockHP < 0) this.currentBlockHP = 0;
        this.updateHPUI();
        this.saveGameProgress();
        if (this.currentBlockHP <= 0) this.nextBlock();
    }

    triggerAgniMelting() {
        const damage = 600 * this.multiplier;
        this.currentBlockHP -= damage;
        if (this.currentBlockHP < 0) this.currentBlockHP = 0;
        this.updateHPUI();
        this.saveGameProgress();
        if (this.currentBlockHP <= 0) this.nextBlock();
    }

    triggerTrishulaCombo() {
        const damage = 1200 * this.multiplier;
        this.currentBlockHP -= damage;
        if (this.currentBlockHP < 0) this.currentBlockHP = 0;
        this.updateHPUI();
        this.saveGameProgress();
        if (this.currentBlockHP <= 0) this.nextBlock();
    }

    pauseAudio() { }
    resumeAudio() { }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.blockGroup) {
            this.blockGroup.rotation.y += 0.007;
            this.blockGroup.rotation.x += 0.002;

            this.blockGroup.scale.x += (1 - this.blockGroup.scale.x) * 0.1;
            this.blockGroup.scale.y += (1 - this.blockGroup.scale.y) * 0.1;
            this.blockGroup.scale.z += (1 - this.blockGroup.scale.z) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }
}