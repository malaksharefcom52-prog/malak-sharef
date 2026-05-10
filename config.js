// === إعدادات اللعبة الأساسية ===
const GAME_CONFIG = {
    // إعدادات الشاشة
    canvas: {
        width: 1200,
        height: 600
    },
    
    // إعدادات الشخصيات
    characters: {
        warrior: {
            name: 'أسد الصحراء',
            health: 150,
            speed: 5,
            power: 12,
            jumpPower: 10,
            attackSpeed: 800, // ميلي ثانية
            size: { width: 40, height: 60 }
        },
        shadow: {
            name: 'الظل السريع',
            health: 100,
            speed: 8,
            power: 8,
            jumpPower: 12,
            attackSpeed: 600, // ميلي ثانية
            size: { width: 35, height: 55 }
        }
    },
    
    // إعدادات الأسلحة
    weapons: [
        {
            id: 'sword',
            name: 'السيف الذهبي',
            damage: 20,
            range: 50,
            fireRate: 600,
            type: 'melee',
            emoji: '⚔️'
        },
        {
            id: 'spear',
            name: 'الرمح الحديدي',
            damage: 25,
            range: 70,
            fireRate: 800,
            type: 'ranged',
            emoji: '🗡️'
        },
        {
            id: 'fire',
            name: 'ألعاب النار',
            damage: 30,
            range: 100,
            fireRate: 1000,
            type: 'ranged',
            emoji: '🔥'
        },
        {
            id: 'arrow',
            name: 'أسهم الشمس',
            damage: 18,
            range: 120,
            fireRate: 500,
            type: 'ranged',
            emoji: '🏹'
        }
    ],
    
    // إعدادات الأعداء
    enemies: [
        {
            id: 'ghoul',
            name: 'جول الظلام',
            health: 30,
            damage: 8,
            speed: 4,
            experience: 50,
            emoji: '👹'
        },
        {
            id: 'vampire',
            name: 'مصاص الدماء',
            health: 50,
            damage: 12,
            speed: 5,
            experience: 100,
            emoji: '🧛'
        },
        {
            id: 'demon',
            name: 'شيطان الحرب',
            health: 70,
            damage: 15,
            speed: 6,
            experience: 150,
            emoji: '😈'
        },
        {
            id: 'witch',
            name: 'ساحرة الليل',
            health: 45,
            damage: 20,
            speed: 3,
            experience: 120,
            emoji: '🧙‍♀️'
        }
    ],
    
    // إعدادات المستويات (12 مستوى من Supernatural)
    levels: [
        {
            id: 1,
            name: 'الدمى المشؤومة',
            story: 'الحلقة الأولى: اكتشاف قوى غامضة في المدينة',
            enemies: [{ type: 'ghoul', count: 5 }],
            waves: 3,
            reward: 200
        },
        {
            id: 2,
            name: 'الإخوة الخاطفون',
            story: 'الحلقة الثانية: مواجهة مع كائنات شريرة',
            enemies: [{ type: 'ghoul', count: 3 }, { type: 'vampire', count: 2 }],
            waves: 3,
            reward: 300
        },
        {
            id: 3,
            name: 'النار والدم',
            story: 'الحلقة الثالثة: معركة شرسة ضد قوى الظلام',
            enemies: [{ type: 'vampire', count: 4 }],
            waves: 4,
            reward: 350
        },
        {
            id: 4,
            name: 'بيت الأشباح',
            story: 'الحلقة الرابعة: اختراق معقل الأعداء',
            enemies: [{ type: 'ghoul', count: 2 }, { type: 'demon', count: 2 }],
            waves: 4,
            reward: 400
        },
        {
            id: 5,
            name: 'عهد القديسين',
            story: 'الحلقة الخامسة: كشف سر خطير',
            enemies: [{ type: 'vampire', count: 3 }, { type: 'witch', count: 2 }],
            waves: 4,
            reward: 450
        },
        {
            id: 6,
            name: 'الأشياء الطيبة',
            story: 'الحلقة السادسة: البحث عن الحقيقة',
            enemies: [{ type: 'demon', count: 3 }],
            waves: 4,
            reward: 500
        },
        {
            id: 7,
            name: 'حاج الراهب',
            story: 'الحلقة السابعة: مواجهة مع قوة عظيمة',
            enemies: [{ type: 'ghoul', count: 4 }, { type: 'vampire', count: 2 }],
            waves: 5,
            reward: 550
        },
        {
            id: 8,
            name: 'حالة اليأس',
            story: 'الحلقة الثامنة: الوقوف على حافة الهاوية',
            enemies: [{ type: 'demon', count: 4 }, { type: 'witch', count: 1 }],
            waves: 5,
            reward: 600
        },
        {
            id: 9,
            name: 'السقوط',
            story: 'الحلقة التاسعة: الصراع مع الشيطان نفسه',
            enemies: [{ type: 'vampire', count: 5 }, { type: 'witch', count: 2 }],
            waves: 5,
            reward: 650
        },
        {
            id: 10,
            name: 'الشيطان في التفاصيل',
            story: 'الحلقة العاشرة: كشف المؤامرة الكبرى',
            enemies: [{ type: 'demon', count: 3 }, { type: 'ghoul', count: 3 }, { type: 'witch', count: 2 }],
            waves: 5,
            reward: 700
        },
        {
            id: 11,
            name: 'صاحب الحلقة',
            story: 'الحلقة الحادية عشرة: المعركة الأخيرة',
            enemies: [{ type: 'demon', count: 5 }, { type: 'vampire', count: 3 }],
            waves: 6,
            reward: 800
        },
        {
            id: 12,
            name: 'البداية',
            story: 'الحلقة الأخيرة: النهاية الأسطورية',
            enemies: [{ type: 'ghoul', count: 4 }, { type: 'vampire', count: 4 }, { type: 'demon', count: 3 }, { type: 'witch', count: 3 }],
            waves: 6,
            reward: 1000
        }
    ],
    
    // إعدادات اللعبة العامة
    game: {
        gravity: 0.6,
        friction: 0.8,
        groundY: 500,
        maxPlayers: 2,
        difficulty: 'normal' // easy, normal, hard
    }
};

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}