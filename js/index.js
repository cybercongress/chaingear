/**
 * requestAnimationFrame
 */
var requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/**
 * Delaunay
 */
var Delaunay = (function() {

    /**
     * Node
     * @public
     */
    function Node(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = !isNaN(id) && isFinite(id) ? id : null;
    }

    Node.prototype = {
        eq: function(p) {
            var dx = this.x - p.x,
                dy = this.y - p.y;
            return (dx < 0 ? -dx : dx) < 0.0001 && (dy < 0 ? -dy : dy) < 0.0001;
        },

        toString: function() {
            return '(x: ' + this.x + ', y: ' + this.y + ')';
        }
    };

    /**
     * Edge
     */
    function Edge(p0, p1) {
        this.nodes = [p0, p1];
    }

    Edge.prototype = {
        eq: function(edge) {
            var na = this.nodes, nb = edge.nodes;
            var na0 = na[0], na1 = na[1], nb0 = nb[0], nb1 = nb[1];
            return (na0.eq(nb0) && na1.eq(nb1)) || (na0.eq(nb1) && na1.eq(nb0));
        }
    };

    /**
     * Triangle
     */
    function Triangle(p0, p1, p2) {
        this.nodes = [p0, p1, p2];
        this.edges = [new Edge(p0, p1), new Edge(p1, p2), new Edge(p2, p0)];
        this._createId();
        this._createCircumscribedCircle();
    }

    Triangle.prototype = {
        id: null,
        _circle: null,

        _createId: function() {
            var nodes, id0, id1, id2;

            nodes = this.nodes;
            id0 = nodes[0].id;
            id1 = nodes[1].id;
            id2 = nodes[2].id;

            if (id0 !== null && id1 !== null && id2 !== null) {
                this.id = [id0, id1, id2].sort().join('_');
            }
        },

        _createCircumscribedCircle: function() {
            var nodes, p0, p1, p2,
                ax, bx, c, t, u,
                circle, dx, dy;

            nodes = this.nodes;
            p0 = nodes[0];
            p1 = nodes[1];
            p2 = nodes[2];

            ax = p1.x - p0.x, ay = p1.y - p0.y;
            bx = p2.x - p0.x, by = p2.y - p0.y;
            c = 2 * (ax * by - ay * bx);

            t = (p1.x * p1.x - p0.x * p0.x + p1.y * p1.y - p0.y * p0.y);
            u = (p2.x * p2.x - p0.x * p0.x + p2.y * p2.y - p0.y * p0.y);

            if (!this._circle) this._circle = {};

            circle = this._circle;
            circle.x = ((p2.y - p0.y) * t + (p0.y - p1.y) * u) / c;
            circle.y = ((p0.x - p2.x) * t + (p1.x - p0.x) * u) / c;

            dx = p0.x - circle.x;
            dy = p0.y - circle.y;
            circle.radiusSq = dx * dx + dy * dy;
        },

        circleContains: function(p) {
            var circle, dx, dy, distSq;

            circle = this._circle;
            dx = circle.x - p.x,
            dy = circle.y - p.y;
            distSq = dx * dx + dy * dy;

            return distSq < circle.radiusSq;
        }
    };


    /**
     * @constructor
     * @public
     */
    function Delaunay(width, height) {
        this.width = width;
        this.height = height;

        this._triangles = null;

        this.clear();
    }

    Delaunay.prototype = {

        clear: function() {
            var p0 = new Node(0, 0),
                p1 = new Node(this.width, 0),
                p2 = new Node(this.width, this.height),
                p3 = new Node(0, this.height);

            this._triangles = [
                new Triangle(p0, p1, p2),
                new Triangle(p0, p2, p3)
            ];

            return this;
        },

        multipleInsert: function(m) {
            for (var i = 0, len = m.length; i < len; i++) {
                this.insert(m[i]);
            }

            return this;
        },

        insert: function(p) {
            var triangles = this._triangles,
                t,
                temps = [],
                edges = [],
                edge,
                polygon = [],
                isDuplicate,
                i, ilen, j, jlen;

            for (ilen = triangles.length, i = 0; i < ilen; i++) {
                t = triangles[i];

                if (t.circleContains(p)) {
                    edges.push(t.edges[0], t.edges[1], t.edges[2]);
                } else {
                    temps.push(t);
                }
            }

            edgesLoop: for (ilen = edges.length, i = 0; i < ilen; i++) {
                edge = edges[i];

                // 辺を比較して重複していれば削除
                for (jlen = polygon.length, j = 0; j < jlen; j++) {
                    if (edge.eq(polygon[j])) {
                        polygon.splice(j, 1);
                        continue edgesLoop;
                    }
                }

                polygon.push(edge);
            }

            for (ilen = polygon.length, i = 0; i < ilen; i++) {
                edge = polygon[i];
                temps.push(new Triangle(edge.nodes[0], edge.nodes[1], p));
            }

            this._triangles = temps;

            return this;
        },

        getTriangles: function() {
            return this._triangles.slice();
        }
    };

    Delaunay.Node = Node;

    return Delaunay;

})();


/**
 * Particle
 * @super Delaunay.Node
 */
var Particle = (function(Node) {

    var currentId = 0,
        getId = function() { return currentId++; };

    function Particle(x, y) {
        Node.call(this, x, y, getId());
        this.vx = 0;
        this.vy = 0;
    }

    Particle.prototype = new Node();

    return Particle;

})(Delaunay.Node);


// Initialize

(function() {

    // Configs

    var BACKGROUND_COLOR = '#eff1ea', // 背景色
        LINE_COLOR = '#303030', // 線の色
        FILL_COLORS = [ // 塗りに使用する色, 三角形の生成順に選択される
            '#00cbd6', '#83d302', '#e80051', '#2087db', '#f4d002',
            '#eda3d4', '#2e8720', '#ea2ebb', '#213877', '#fc771e',
            '#a6dbd9', '#c8e067', '#ed5131', '#e2d9d9', '#f4eea8'
        ],
        PATTERNS_URL = [ // パターンの画像 URL, 三角形の生成順に選択される
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiVFBQ2M8ABPfv33dkQAJMDDgA4////7FK4NRBugRAgAEAXhEHBXvZgh4AAAAASUVORK5CYII%3D',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAB1JREFUeNpiUFBQ2P///38GEGYEETDAxIAEAAIMACllChoZz6oRAAAAAElFTkSuQmCC',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAC1JREFUeNpiVFBQ2M/AwODIgAAgPgMTNkGYBIYgSDETNkGYDgxBdKNQ7AIIMABhpgcrohF6AgAAAABJRU5ErkJggg%3D%3D',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADJJREFUeNpi+P//PwMyVlBQ2M/EgAQUFRX3AylHJnQBEJsJXQAEGEFmIAvcv3+fASDAANwmFUHSvnUvAAAAAElFTkSuQmCC',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAGCAYAAADkOT91AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACBJREFUeNpiUFBQ2P///38GGGZiQAOEBRhB+vCqAAgwAAmADR3HFFILAAAAAElFTkSuQmCC',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAKCAYAAACJxx+AAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEdJREFUeNpiUlBQ2A/EDP///wdjdD4jiAME+4HYERvNxAAByIIofEaQMYqKigy4ANiE+/fvwwVAbGQ+A50ciQ8wMRAAAAEGAKNCOWlhLo6PAAAAAElFTkSuQmCC'
        ];


    // Vars

    var canvas, context,
        screenWidth, screenHeight, screenMinSize,
        centerX, centerY,
        delaunay,
        particles = [],
        colorIndex = 0,
        colorTable = {},
        patterns = [],
        patternIndex = 0,
        patternTable = {},
        backgroundPattern,
        mouse = { x: 0, y: 0 },
        time,
        gui, control, maxSpeedCtl, minSpeedCtl,
        img, count, onLoad,
        i, len;


    // Event Listeners

    function resize(e) {
        screenWidth   = canvas.width = window.innerWidth;
        screenHeight  = canvas.height = window.innerHeight;
        screenMinSize = Math.min(screenWidth, screenHeight);
        centerX       = screenWidth * 0.5;
        centerY       = screenHeight * 0.5;

        context = canvas.getContext('2d');
        context.lineWidth = 3.5;
        context.strokeStyle = LINE_COLOR;
        context.lineCap = context.lineJoin = 'round';

        if (delaunay) {
            delaunay.width = screenWidth;
            delaunay.height = screenHeight;
        }
    }

    function mouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }


    // Functions

    function addParticle(x, y) {
        if (particles.length >= control.maxNum) {
            particles.shift();
            addParticle(x, y);
            return;
        }
        var p = new Particle(x, y),
            l = Math.random() * (control.maxSpeed - control.minSpeed) + control.minSpeed,
            a = Math.random() * Math.PI * 2;
        p.vx = l * Math.cos(a);
        p.vy = l * Math.sin(a);
        particles.push(p);
    }


    // GUI Control

    control = {
        spawnTime: 500,
        maxNum: 25,
        maxSpeed: 1,
        minSpeed: 0.5
    };


    // Init

    canvas = document.getElementById('c');

    window.addEventListener('resize', resize, false);
    resize(null);

    mouse.x = screenWidth * 0.5;
    mouse.y = screenHeight * 0.5;

    delaunay = new Delaunay(screenWidth, screenHeight);

    for (i = 0, len = control.maxNum; i < len; i++) {
        addParticle(Math.random() * screenMinSize + centerX - screenMinSize * 0.5, Math.random() * screenMinSize + centerY - screenMinSize * 0.5);
    }


    // Loop

    var loop = function() {
        var TWO_PI = Math.PI * 2,
            w      = screenWidth,
            h      = screenHeight,
            ctx    = context,
            now    = new Date().getTime(),
            dx, dy, distSq, ax, ay,
            triangles, t, id, p0, p1, p2,
            ct, pt, cl, pl,
            i, len, p;

        if (now - time > control.spawnTime) {
            addParticle(mouse.x, mouse.y);
            time = now;
        }

        ctx.save();
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = backgroundPattern;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
        ctx.restore();

        delaunay.clear();

        for (len = particles.length, i = 0; i < len; i++) {
            p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            // 反射
            if (p.x < 0) {
                p.x = 0;
                if (p.vx < 0) p.vx *= -1;
            }
            if (p.x > w) {
                p.x = w;
                if (p.vx > 0) p.vx *= -1;
            }
            if (p.y < 0) {
                p.y = 0;
                if (p.vy < 0) p.vy *= -1;
            }
            if (p.y > h) {
                p.y = h;
                if (p.vy > 0) p.vy *= -1;
            }
        }

        triangles = delaunay.multipleInsert(particles).getTriangles();

        ct = colorTable;
        pt = patternTable;
        cl = FILL_COLORS.length;
        pl = patterns.length;

        for (len = triangles.length, i = 0; i < len; i++) {
            t = triangles[i];
            id = t.id;
            p0 = t.nodes[0];
            p1 = t.nodes[1];
            p2 = t.nodes[2];

            if (id === null) continue;

            if (!ct[id]) {
                ct[id] = FILL_COLORS[colorIndex];
                colorIndex = (colorIndex + 1) % cl;
            }
            if (!pt[id]) {
                pt[id] = patterns[patternIndex];
                patternIndex = (patternIndex + 1) % pl;
            }

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.closePath();
            ctx.fillStyle = ct[id];
            ctx.fill();
            ctx.translate(p0.x, p0.y);
            ctx.rotate(Math.atan2(p0.y - p1.y, p0.x - p1.x));
            ctx.fillStyle = pt[id];
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(loop);
    };


    // GUI

    gui = new dat.GUI();
    gui.add(control, 'maxNum', 0, 50).name('Max Num');
    maxSpeedCtl = gui.add(control, 'maxSpeed', 0, 5).name('Max Speed').onChange(function() {
        if (control.minSpeed > control.maxSpeed)
            control.minSpeed = control.maxSpeed;
        minSpeedCtl.updateDisplay();
    });
    minSpeedCtl = gui.add(control, 'minSpeed', 0, 5).name('Min Speed').onChange(function() {
        if (control.minSpeed > control.maxSpeed)
            control.maxSpeed = control.minSpeed;
        maxSpeedCtl.updateDisplay();
    });
    gui.add(control, 'spawnTime', 50, 1000).name('Spawn Time');
    gui.close();


    // Load Images

    count  = PATTERNS_URL.length;
    onLoad = function(e) {
        patterns.push(context.createPattern(e.target, 'repeat'));

        if (--count === 0) {
            backgroundPattern = patterns[Math.floor(patterns.length * Math.random())];
            patterns.push('rgba(0, 0, 0, 0)');

            canvas.addEventListener('mousemove', mouseMove, false);

            time = new Date().getTime();

            // Start update
            loop();
        }
    };

    for (i = 0, len = PATTERNS_URL.length; i < len; i++) {
        img = new Image();
        img.addEventListener('load', onLoad, false);
        img.src = PATTERNS_URL[i];
    }

})();