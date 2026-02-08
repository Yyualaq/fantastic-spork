/**
 * LevelBuilder — Creates the dark fantasy level geometry
 * Builds ground, walls, corridors, a boss arena, bonfires (checkpoints),
 * and shortcuts. All geometry uses basic Three.js shapes with materials.
 */
'use strict';

window.GAME = window.GAME || {};

GAME.LevelBuilder = class LevelBuilder {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];    // Array of {mesh, box} for collision detection
        this.bonfires = [];     // Checkpoint positions [{position, mesh}]
        this.bossArenaCenter = new THREE.Vector3(0, 0, -120);
        this.bossArenaRadius = 25;
    }

    /** Build the entire level and return references */
    build() {
        this._createGround();
        this._createStartingArea();
        this._createCorridor();
        this._createShortcut();
        this._createBossArena();
        this._createBonfires();
        this._createObstacles();
        this._createAmbientDetails();
        return {
            colliders: this.colliders,
            bonfires: this.bonfires,
            bossArenaCenter: this.bossArenaCenter,
            bossArenaRadius: this.bossArenaRadius
        };
    }

    /** Create textured ground plane */
    _createGround() {
        const groundGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9,
            metalness: 0.1
        });
        // Add vertex displacement for uneven terrain feel
        const posAttr = groundGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, (Math.sin(x * 0.3) * Math.cos(y * 0.3)) * 0.3);
        }
        groundGeo.computeVertexNormals();
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /** Starting courtyard area */
    _createStartingArea() {
        // Surrounding walls for starting area
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.85,
            metalness: 0.15
        });

        // Left wall
        this._addWall(-15, 3, 5, 1, 6, 20, wallMat);
        // Right wall
        this._addWall(15, 3, 5, 1, 6, 20, wallMat);
        // Back wall
        this._addWall(0, 3, 15, 30, 6, 1, wallMat);

        // Pillars at entrance
        this._addPillar(-5, 0, -5);
        this._addPillar(5, 0, -5);
    }

    /** Main corridor leading to boss arena */
    _createCorridor() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });

        // Left corridor wall
        this._addWall(-10, 3, -40, 1, 6, 60, wallMat);
        // Right corridor wall
        this._addWall(10, 3, -40, 1, 6, 60, wallMat);

        // Alcoves for enemy ambush positions
        this._addWall(-14, 3, -25, 8, 6, 1, wallMat);
        this._addWall(-14, 3, -35, 8, 6, 1, wallMat);

        // Corridor end walls leading to boss gate
        this._addWall(-10, 3, -80, 1, 6, 20, wallMat);
        this._addWall(10, 3, -80, 1, 6, 20, wallMat);
    }

    /** Shortcut gate connecting boss area back to start */
    _createShortcut() {
        const gateMat = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.7,
            metalness: 0.3
        });

        // Shortcut passage on the left side
        // Gate frame
        this._addWall(-18, 3, -10, 5, 6, 1, gateMat);
        this._addWall(-18, 3, -15, 5, 6, 1, gateMat);
        this._addWall(-20, 3, -12.5, 1, 6, 5, gateMat);
    }

    /** Boss arena — circular area with pillars */
    _createBossArena() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x2e2e2e,
            roughness: 0.8,
            metalness: 0.2
        });

        // Arena walls (octagonal shape approximation)
        const r = this.bossArenaRadius + 2;
        const cx = this.bossArenaCenter.x;
        const cz = this.bossArenaCenter.z;
        const sides = 8;
        for (let i = 0; i < sides; i++) {
            // Leave a gap for the entrance (side 0)
            if (i === 0) continue;
            const angle = (i / sides) * Math.PI * 2;
            const nextAngle = ((i + 1) / sides) * Math.PI * 2;
            const mx = cx + Math.cos((angle + nextAngle) / 2) * r;
            const mz = cz + Math.sin((angle + nextAngle) / 2) * r;
            const wallAngle = (angle + nextAngle) / 2 + Math.PI / 2;
            const wallLen = 2 * r * Math.sin(Math.PI / sides);

            const wallGeo = new THREE.BoxGeometry(wallLen, 8, 1.5);
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(mx, 4, mz);
            wall.rotation.y = wallAngle;
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);

            // Add collider (use axis-aligned bounding box)
            wall.geometry.computeBoundingBox();
            const box = new THREE.Box3().setFromObject(wall);
            this.colliders.push({ mesh: wall, box });
        }

        // Arena pillars (4 inner pillars)
        const pillarDist = 12;
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            this._addPillar(
                cx + Math.cos(a) * pillarDist,
                0,
                cz + Math.sin(a) * pillarDist
            );
        }

        // Boss arena floor highlight (slightly different color)
        const arenaFloor = new THREE.Mesh(
            new THREE.CircleGeometry(this.bossArenaRadius, 32),
            new THREE.MeshStandardMaterial({
                color: 0x1f1a15,
                roughness: 0.95,
                metalness: 0.05
            })
        );
        arenaFloor.rotation.x = -Math.PI / 2;
        arenaFloor.position.copy(this.bossArenaCenter);
        arenaFloor.position.y = 0.02;
        arenaFloor.receiveShadow = true;
        this.scene.add(arenaFloor);
    }

    /** Create bonfire checkpoints */
    _createBonfires() {
        const positions = [
            new THREE.Vector3(0, 0, 8),       // Starting bonfire
            new THREE.Vector3(0, 0, -65),      // Mid-level bonfire
        ];

        for (const pos of positions) {
            const bonfire = this._createBonfireMesh(pos);
            this.bonfires.push({
                position: pos.clone(),
                mesh: bonfire
            });
        }
    }

    /** Create a visual bonfire mesh with fire particles */
    _createBonfireMesh(position) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Base stones
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const stone = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 6, 4),
                stoneMat
            );
            stone.position.set(Math.cos(a) * 0.6, 0.15, Math.sin(a) * 0.6);
            stone.scale.y = 0.6;
            stone.castShadow = true;
            group.add(stone);
        }

        // Fire glow (emissive cone)
        const fireMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1.2, 8),
            fireMat
        );
        fire.position.y = 0.8;
        fire.name = 'bonfireFire';
        group.add(fire);

        // Point light for fire illumination
        const fireLight = new THREE.PointLight(0xff6600, 2, 15);
        fireLight.position.y = 1.2;
        fireLight.castShadow = false; // Performance: skip shadow for fire lights
        group.add(fireLight);

        this.scene.add(group);
        return group;
    }

    /** Add obstacles/rubble throughout the level */
    _createObstacles() {
        const rubbleMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.95
        });

        const rubblePositions = [
            [3, 0.4, -15], [-4, 0.5, -30], [6, 0.3, -50],
            [-7, 0.6, -45], [2, 0.4, -60], [-3, 0.3, -20]
        ];

        for (const [x, s, z] of rubblePositions) {
            const size = 0.5 + Math.random() * s;
            const rubble = new THREE.Mesh(
                new THREE.DodecahedronGeometry(size, 0),
                rubbleMat
            );
            rubble.position.set(x, size * 0.5, z);
            rubble.rotation.set(Math.random(), Math.random(), Math.random());
            rubble.castShadow = true;
            rubble.receiveShadow = true;
            this.scene.add(rubble);

            rubble.geometry.computeBoundingBox();
            const box = new THREE.Box3().setFromObject(rubble);
            this.colliders.push({ mesh: rubble, box });
        }
    }

    /** Add atmospheric details (broken columns, fog pillars, etc.) */
    _createAmbientDetails() {
        // Broken columns
        const colMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.8,
            metalness: 0.2
        });

        const colPositions = [
            [8, -20], [-8, -40], [7, -55], [-6, -70]
        ];

        for (const [x, z] of colPositions) {
            const height = 2 + Math.random() * 3;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.6, height, 8),
                colMat
            );
            col.position.set(x, height / 2, z);
            col.castShadow = true;
            col.receiveShadow = true;
            this.scene.add(col);
        }
    }

    // ---- Helper methods ----

    /** Add an axis-aligned box wall to the scene */
    _addWall(x, y, z, w, h, d, material) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const wall = new THREE.Mesh(geo, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);

        wall.geometry.computeBoundingBox();
        const box = new THREE.Box3().setFromObject(wall);
        this.colliders.push({ mesh: wall, box });
        return wall;
    }

    /** Add a decorative pillar */
    _addPillar(x, groundY, z) {
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x505050,
            roughness: 0.75,
            metalness: 0.25
        });

        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.7, 5, 8),
            pillarMat
        );
        pillar.position.set(x, groundY + 2.5, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        this.scene.add(pillar);

        pillar.geometry.computeBoundingBox();
        const box = new THREE.Box3().setFromObject(pillar);
        this.colliders.push({ mesh: pillar, box });

        // Pillar cap
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.6, 0.3, 8),
            pillarMat
        );
        cap.position.set(x, groundY + 5.15, z);
        cap.castShadow = true;
        this.scene.add(cap);
    }
};
