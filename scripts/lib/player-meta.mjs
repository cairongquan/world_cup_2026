/** 球员中文名、俱乐部、身价、Transfermarkt ID */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const _ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const _ZH_EXTRA_PATH = path.join(_ROOT, 'data', 'player-zh-extra.json');

/** @type {Record<string, { zh: string, nameEn?: string }>} */
let PLAYER_ZH_EXTRA = {};
try {
  if (fs.existsSync(_ZH_EXTRA_PATH)) {
    PLAYER_ZH_EXTRA = JSON.parse(fs.readFileSync(_ZH_EXTRA_PATH, 'utf8'));
  }
} catch {
  PLAYER_ZH_EXTRA = {};
}

export function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const TM_CDN = 'https://tmssl.akamaized.net/images/portrait/medium';
export const TM_CDN_ALT = 'https://img.a.transfermarkt.technology/portrait/medium';

export const PLAYER_META = {
  'guillermo ochoa': { zh: '吉列尔莫·奥乔亚', club: '利马索尔', v: 80, tm: '29591' },
  'carlos acevedo': { zh: '卡洛斯·阿塞韦多', club: '桑托斯拉古纳', v: 300 },
  'raul rangel': { zh: '劳尔·兰赫尔', club: '瓜达拉哈拉', v: 150 },
  'edson alvarez': { zh: '埃德森·阿尔瓦雷斯', club: '费内巴切', v: 2800, tm: '331505' },
  'johan vasquez': { zh: '约翰·巴斯克斯', club: '热那亚', v: 1200, tm: '354878' },
  'cesar montes': { zh: '塞萨尔·蒙特斯', club: '莫斯科火车头', v: 800 },
  'julian araujo': { zh: '胡利安·阿拉乌霍', club: '凯尔特人', v: 900, tm: '474800' },
  'luis chavez': { zh: '路易斯·查韦斯', club: '莫斯科迪纳摩', v: 600 },
  'orbelin pineda': { zh: '奥贝尔林·皮内达', club: '雅典AEK', v: 500 },
  'carlos rodriguez': { zh: '卡洛斯·罗德里格斯', club: '蓝十字', v: 400 },
  'obed vargas': { zh: '奥贝德·巴尔加斯', club: '马德里竞技', v: 800, tm: '709187' },
  'raul jimenez': { zh: '劳尔·希门尼斯', club: '富勒姆', v: 500, tm: '102117' },
  'santiago gimenez': { zh: '圣地亚哥·希门尼斯', club: 'AC米兰', v: 4500, tm: '604958' },
  'cesar huerta': { zh: '塞萨尔·韦尔塔', club: '安德莱赫特', v: 700 },
  'german berterame': { zh: '赫尔曼·贝尔特拉梅', club: '迈阿密国际', v: 600 },
  'ronwen williams': { zh: '罗文·威廉姆斯', club: '马梅洛迪日落', v: 350 },
  'percy tau': { zh: '珀西·塔乌', club: '阿尔阿赫利', v: 400 },
  'themba zwane': { zh: '滕巴·兹瓦内', club: '马梅洛迪日落', v: 300 },
  'teboho mokoena': { zh: '特博霍·莫科埃纳', club: '马德里竞技', v: 1200 },
  'antonin kinsky': { zh: '安东宁·金斯基', club: '热刺', v: 1500, tm: '725912' },
  'matej kovar': { zh: '马泰·科瓦尔', club: '埃因霍温', v: 1200, tm: '379848' },
  'jindrich stanek': { zh: '因德里赫·斯塔内克', club: '布拉格斯拉维亚', v: 400 },
  'vladimir coufal': { zh: '弗拉基米尔·库法尔', club: '霍芬海姆', v: 600, tm: '157672' },
  'robin hranac': { zh: '罗宾·赫拉纳奇', club: '霍芬海姆', v: 800 },
  'david zima': { zh: '大卫·齐马', club: '布拉格斯拉维亚', v: 500 },
  'ladislav krejci': { zh: '拉迪斯拉夫·克雷伊奇', club: '狼队', v: 700 },
  'tomas soucek': { zh: '托马斯·绍切克', club: '西汉姆联', v: 2000, tm: '283628' },
  'lukas provod': { zh: '卢卡斯·普罗沃德', club: '布拉格斯拉维亚', v: 1200 },
  'pavel sulc': { zh: '帕维尔·舒尔茨', club: '里昂', v: 1500 },
  'michal sadilek': { zh: '米哈尔·萨迪莱克', club: '布拉格斯拉维亚', v: 600 },
  'patrik schick': { zh: '帕特里克·希克', club: '勒沃库森', v: 2500, tm: '242086' },
  'adam hlozek': { zh: '亚当·赫洛热克', club: '霍芬海姆', v: 1200, tm: '484553' },
  'jan kuchta': { zh: '扬·库赫塔', club: '布拉格斯巴达', v: 800 },
  'matej vydra': { zh: '马泰·维德拉', club: '比尔森胜利', v: 300 },
  'david ospina': { zh: '大卫·奥斯皮纳', club: '国民竞技', v: 200 },
  'camilo vargas': { zh: '卡米洛·巴尔加斯', club: '阿特拉斯', v: 250 },
  'kevin mier': { zh: '凯文·米耶尔', club: '蓝十字', v: 400 },
  'davinson sanchez': { zh: '达维森·桑切斯', club: '加拉塔萨雷', v: 1800, tm: '341429' },
  'daniel munoz': { zh: '丹尼尔·穆尼奥斯', club: '水晶宫', v: 2000, tm: '570461' },
  'yerry mina': { zh: '耶里·米纳', club: '卡利亚里', v: 400 },
  'jhon lucumi': { zh: '约翰·卢库米', club: '博洛尼亚', v: 1500 },
  'james rodriguez': { zh: '哈梅斯·罗德里格斯', club: '明尼苏达联', v: 300, tm: '88103' },
  'jefferson lerma': { zh: '杰斐逊·莱尔马', club: '水晶宫', v: 1200 },
  'richard rios': { zh: '理查德·里奥斯', club: '本菲卡', v: 2200 },
  'juan cuadrado': { zh: '胡安·夸德拉多', club: '比萨', v: 200, tm: '59968' },
  'luis diaz': { zh: '路易斯·迪亚斯', club: '拜仁慕尼黑', v: 7000, tm: '424784' },
  'rafael borre': { zh: '拉斐尔·博雷', club: '国际米兰', v: 800 },
  'cucho hernandez': { zh: '库乔·埃尔南德斯', club: '皇家贝蒂斯', v: 1800 },
  'jhon duran': { zh: '约翰·杜兰', club: '泽尼特', v: 2500 },
  'abdukodir khusanov': { zh: '阿布杜科迪尔·胡萨诺夫', club: '曼城', v: 3500, tm: '719673' },
  'eldor shomurodov': { zh: '埃尔多尔·绍穆罗多夫', club: '巴萨克赛尔', v: 400 },
  'kim seung-gyu': { zh: '金承奎', club: '东京FC', v: 300 },
  'jo hyeon-woo': { zh: '赵贤祐', club: '蔚山现代', v: 350 },
  'song bum-keun': { zh: '宋范根', club: '全北现代', v: 200 },
  'kim min-jae': { zh: '金玟哉', club: '拜仁慕尼黑', v: 4500, tm: '370133' },
  'lee han-beom': { zh: '李汉范', club: '中日德兰', v: 400 },
  'seol young-woo': { zh: '薛英佑', club: '贝尔格莱德红星', v: 500 },
  'lee kang-in': { zh: '李刚仁', club: '巴黎圣日耳曼', v: 5000, tm: '557149' },
  'lee jae-sung': { zh: '李在城', club: '美因茨', v: 1200 },
  'hwang hee-chan': { zh: '黄喜灿', club: '狼队', v: 1500, tm: '292225' },
  'hwang in-beom': { zh: '黄仁范', club: '费耶诺德', v: 800 },
  'paik seung-ho': { zh: '白昇浩', club: '伯明翰', v: 600 },
  'son heung-min': { zh: '孙兴慜', club: '洛杉矶FC', v: 2000, tm: '418560' },
  'cho gue-sung': { zh: '曹圭成', club: '中日德兰', v: 500 },
  'oh hyeon-gyu': { zh: '吴贤揆', club: '贝西克塔斯', v: 400 },
  'pedri': { zh: '佩德里', club: '巴塞罗那', v: 14000, tm: '683840' },
  'lamine yamal': { zh: '亚马尔', club: '巴塞罗那', v: 18000, tm: '937958' },
  'rodri': { zh: '罗德里', club: '曼城', v: 11000, tm: '357565' },
  'darwin nunez': { zh: '达尔文·努涅斯', club: '利物浦', v: 4500, tm: '488632' },
  'federico valverde': { zh: '费德里科·巴尔韦德', club: '皇家马德里', v: 12000, tm: '369081' },
  'ronald araujo': { zh: '罗纳德·阿劳霍', club: '巴塞罗那', v: 3500, tm: '480267' },
  'achraf hakimi': { zh: '阿什拉夫·哈基米', club: '巴黎圣日耳曼', v: 6000, tm: '398073' },
  'brahim diaz': { zh: '卜拉欣·迪亚斯', club: '皇家马德里', v: 4000, tm: '314678' },
  'sead kolasinac': { zh: '塞阿德·科拉希纳茨', club: '亚特兰大', v: 500, tm: '126665' },
  'edin dzeko': { zh: '埃丁·哲科', club: '沙尔克04', v: 100, tm: '28318' },
  'ermedin demirovic': { zh: '埃尔梅丁·德米罗维奇', club: '斯图加特', v: 2000 },
  'alisson': { zh: '阿利松', club: '利物浦', v: 2000, tm: '105470' },
  'marquinhos': { zh: '马尔基尼奥斯', club: '巴黎圣日耳曼', v: 3500, tm: '181767' },
  'gabriel magalhaes': { zh: '加布里埃尔', club: '阿森纳', v: 7500, tm: '435338' },
  'bruno guimaraes': { zh: '布鲁诺·吉马良斯', club: '纽卡斯尔', v: 8000, tm: '520624' },
  'casemiro': { zh: '卡塞米罗', club: '曼联', v: 1500, tm: '16306' },
  'lucas paqueta': { zh: '卢卡斯·帕奎塔', club: '弗拉门戈', v: 3500, tm: '444523' },
  'vinicius jr': { zh: '维尼修斯', club: '皇家马德里', v: 17000, tm: '371998' },
  'neymar': { zh: '内马尔', club: '桑托斯', v: 1500, tm: '68290' },
  'richarlison': { zh: '理查利森', club: '热刺', v: 2500, tm: '378710' },
  'raphinha': { zh: '拉菲尼亚', club: '巴塞罗那', v: 8000, tm: '411295' },
  'thibaut courtois': { zh: '蒂博·库尔图瓦', club: '皇家马德里', v: 2000, tm: '108390' },
  'kevin de bruyne': { zh: '凯文·德布劳内', club: '那不勒斯', v: 4000, tm: '88755' },
  'romelu lukaku': { zh: '罗梅卢·卢卡库', club: '那不勒斯', v: 2500, tm: '51271' },
  'jeremy doku': { zh: '杰雷米·多库', club: '曼城', v: 5500, tm: '502821' },
  'leandro trossard': { zh: '莱昂德罗·特罗萨德', club: '阿森纳', v: 3000, tm: '144028' },
  'mike maignan': { zh: '迈克·迈尼昂', club: 'AC米兰', v: 3500, tm: '182906' },
  'william saliba': { zh: '威廉·萨利巴', club: '阿森纳', v: 8000, tm: '495666' },
  'jules kounde': { zh: '朱尔·孔德', club: '巴塞罗那', v: 6000, tm: '411975' },
  'dayot upamecano': { zh: '达约·于帕梅卡诺', club: '拜仁慕尼黑', v: 5000, tm: '344598' },
  'theo hernandez': { zh: '特奥·埃尔南德斯', club: '利雅得新月', v: 3000, tm: '339808' },
  'lucas hernandez': { zh: '卢卡斯·埃尔南德斯', club: '巴黎圣日耳曼', v: 2500, tm: '193880' },
  "n'golo kante": { zh: '恩戈洛·坎特', club: '费内巴切', v: 800, tm: '125781' },
  'ngolo kante': { zh: '恩戈洛·坎特', club: '费内巴切', v: 800, tm: '125781' },
  'aurelien tchouameni': { zh: '奥雷利安·楚阿梅尼', club: '皇家马德里', v: 9000, tm: '413112' },
  'adrien rabiot': { zh: '阿德里安·拉比奥', club: 'AC米兰', v: 2500, tm: '189503' },
  'kylian mbappe': { zh: '基利安·姆巴佩', club: '皇家马德里', v: 18000, tm: '342229' },
  'ousmane dembele': { zh: '奥斯曼·登贝莱', club: '巴黎圣日耳曼', v: 9000, tm: '288230' },
  'michael olise': { zh: '迈克尔·奥利塞', club: '拜仁慕尼黑', v: 13000, tm: '566723' },
  'marcus thuram': { zh: '马库斯·图拉姆', club: '国际米兰', v: 5500, tm: '318528' },
  'desire doue': { zh: '德西雷·杜埃', club: '巴黎圣日耳曼', v: 9000, tm: '914562' },
  'harry kane': { zh: '哈里·凯恩', club: '拜仁慕尼黑', v: 9000, tm: '132098' },
  'jude bellingham': { zh: '裘德·贝林厄姆', club: '皇家马德里', v: 16000, tm: '581678' },
  'phil foden': { zh: '菲尔·福登', club: '曼城', v: 10000, tm: '406635' },
  'declan rice': { zh: '德克兰·赖斯', club: '阿森纳', v: 11000, tm: '357662' },
  'bukayo saka': { zh: '布卡约·萨卡', club: '阿森纳', v: 13000, tm: '433177' },
  'trent alexander-arnold': { zh: '特伦特·亚历山大-阿诺德', club: '皇家马德里', v: 7500, tm: '314314' },
  'cole palmer': { zh: '科尔·帕尔默', club: '切尔西', v: 12000, tm: '568177' },
  'erling haaland': { zh: '埃尔林·哈兰德', club: '曼城', v: 18000, tm: '418560' },
  'martin odegaard': { zh: '马丁·厄德高', club: '阿森纳', v: 8500, tm: '316264' },
  'david alaba': { zh: '大卫·阿拉巴', club: '皇家马德里', v: 400, tm: '59016' },
  'marcel sabitzer': { zh: '马塞尔·萨比策', club: '多特蒙德', v: 2000, tm: '106987' },
  'marko arnautovic': { zh: '马尔科·阿瑙托维奇', club: '贝尔格莱德红星', v: 300, tm: '45455' },
  'cristiano ronaldo': { zh: 'C罗', club: '利雅得胜利', v: 1200, tm: '8198' },
  'bernardo silva': { zh: '贝尔纳多·席尔瓦', club: '曼城', v: 7000, tm: '206225' },
  'bruno fernandes': { zh: '布鲁诺·费尔南德斯', club: '曼联', v: 5000, tm: '240306' },
  'ruben dias': { zh: '鲁本·迪亚斯', club: '曼城', v: 6500, tm: '258004' },
  'emiliano martinez': { zh: '埃米利亚诺·马丁内斯', club: '阿斯顿维拉', v: 2000, tm: '111873' },
  'cristian romero': { zh: '克里斯蒂安·罗梅罗', club: '热刺', v: 5000, tm: '355915' },
  'lisandro martinez': { zh: '利桑德罗·马丁内斯', club: '曼联', v: 4000, tm: '480762' },
  'nicolas otamendi': { zh: '尼古拉斯·奥塔门迪', club: '本菲卡', v: 200, tm: '54781' },
  'enzo fernandez': { zh: '恩佐·费尔南德斯', club: '切尔西', v: 7500, tm: '648195' },
  'alexis mac allister': { zh: '亚历克西斯·麦卡利斯特', club: '利物浦', v: 9000, tm: '534033' },
  'rodrigo de paul': { zh: '罗德里戈·德保罗', club: '迈阿密国际', v: 2500, tm: '255901' },
  'lionel messi': { zh: '梅西', club: '迈阿密国际', v: 1500, tm: '28003' },
  'lautaro martinez': { zh: '劳塔罗·马丁内斯', club: '国际米兰', v: 9500, tm: '406625' },
  'julian alvarez': { zh: '胡利安·阿尔瓦雷斯', club: '马德里竞技', v: 10000, tm: '576024' },
  'alejandro garnacho': { zh: '亚历杭德罗·加纳乔', club: '切尔西', v: 5000, tm: '671208' },
  'mohamed salah': { zh: '穆罕默德·萨拉赫', club: '利物浦', v: 5000, tm: '148455' },
  'takefusa kubo': { zh: '久保建英', club: '皇家社会', v: 5000, tm: '405973' },
  'wataru endo': { zh: '远藤航', club: '利物浦', v: 800, tm: '146310' },
  'ritsu doan': { zh: '堂安律', club: '法兰克福', v: 1500, tm: '331829' },
  'ayase ueda': { zh: '上田绮世', club: '费耶诺德', v: 1200 },
  'alexander isak': { zh: '亚历山大·伊萨克', club: '利物浦', v: 12000, tm: '349066' },
  'viktor gyokeres': { zh: '维克托·哲凯赖什', club: '阿森纳', v: 7500, tm: '431755' },
  'luka modric': { zh: '卢卡·莫德里奇', club: 'AC米兰', v: 400, tm: '27992' },
  'josko gvardiol': { zh: '约什科·格瓦迪奥尔', club: '曼城', v: 7500, tm: '475959' },
  'mateo kovacic': { zh: '马特奥·科瓦契奇', club: '曼城', v: 4000, tm: '187492' },
  'andrej kramaric': { zh: '安德雷·克拉马里奇', club: '霍芬海姆', v: 500, tm: '46580' },
  'ivan perisic': { zh: '伊万·佩里西奇', club: '埃因霍温', v: 200, tm: '42460' },
  'wilson isidor': { zh: '威尔逊·伊西多尔', club: '桑德兰', v: 2000 },
  'frantzdy pierrot': { zh: '弗朗茨迪·皮埃罗', club: '里泽斯堡', v: 600 },
  'wilfried singo': { zh: '维利弗里德·辛戈', club: '加拉塔萨雷', v: 2000 },
  'evan ndicka': { zh: '埃万·恩迪卡', club: '罗马', v: 3500, tm: '344695' },
  'franck kessie': { zh: '弗兰克·凯西', club: '利雅得新月', v: 1500, tm: '294638' },
  'nicolas pepe': { zh: '尼古拉斯·佩佩', club: '比利亚雷亚尔', v: 800, tm: '343052' },
  'amad diallo': { zh: '阿马德·迪亚洛', club: '曼联', v: 4500, tm: '507470' },
  'jamal musiala': { zh: '贾马尔·穆西亚拉', club: '拜仁慕尼黑', v: 14000, tm: '580195' },
  'florian wirtz': { zh: '弗洛里安·维尔茨', club: '利物浦', v: 14000, tm: '598577' },
  'virgil van dijk': { zh: '维吉尔·范戴克', club: '利物浦', v: 2300, tm: '139208' },
  'memphis depay': { zh: '孟菲斯·德佩', club: '科林蒂安', v: 600, tm: '167850' },
  'cody gakpo': { zh: '科迪·加克波', club: '利物浦', v: 5500, tm: '434675' },
  'frenkie de jong': { zh: '弗兰基·德容', club: '巴塞罗那', v: 4500, tm: '326330' },
  'christian pulisic': { zh: '克里斯蒂安·普利西奇', club: 'AC米兰', v: 6000, tm: '315779' },
  'alphonso davies': { zh: '阿方索·戴维斯', club: '拜仁慕尼黑', v: 5000, tm: '424204' },
  'jonathan david': { zh: '乔纳森·戴维', club: '尤文图斯', v: 4500, tm: '488362' },
  'moises caicedo': { zh: '莫伊塞斯·凯塞多', club: '切尔西', v: 9000, tm: '687626' },
  'enner valencia': { zh: '恩纳·瓦伦西亚', club: '巴西国际', v: 200 },
  'andrew robertson': { zh: '安德鲁·罗伯逊', club: '利物浦', v: 1800, tm: '234803' },
  'scott mctominay': { zh: '斯科特·麦克托米奈', club: '那不勒斯', v: 5000, tm: '315969' },
  'john mcginn': { zh: '约翰·麦金', club: '阿斯顿维拉', v: 2500, tm: '193116' },
  'granit xhaka': { zh: '格拉尼特·扎卡', club: '桑德兰', v: 1500, tm: '111455' },
  'sadio mane': { zh: '萨迪奥·马内', club: '利雅得胜利', v: 800, tm: '200512' },
  'mohammed kudus': { zh: '穆罕默德·库杜斯', club: '热刺', v: 5500, tm: '543499' },
  'thomas partey': { zh: '托马斯·帕尔特伊', club: '比利亚雷亚尔', v: 800, tm: '227196' },
  'riyard mahrez': { zh: '里亚德·马赫雷斯', club: '阿赫利', v: 500, tm: '122651' },
  'mehdi taremi': { zh: '迈赫迪·塔雷米', club: '国际米兰', v: 2000, tm: '242870' },
  'sardar azmoun': { zh: '萨达尔·阿兹蒙', club: '沙巴布', v: 400 },
  'chris wood': { zh: '克里斯·伍德', club: '诺丁汉森林', v: 800, tm: '108641' },
  'miguel almiron': { zh: '米格尔·阿尔米隆', club: '亚特兰大联', v: 1200, tm: '223977' },
  'akram afif': { zh: '阿克拉姆·阿菲夫', club: '萨德', v: 400 },
  'mousa al-taamari': { zh: '穆萨·塔马里', club: '雷恩', v: 600 },
  'hakan calhanoglu': { zh: '哈坎·恰尔汗奥卢', club: '国际米兰', v: 3500, tm: '126665' },
  'arda guler': { zh: '阿尔达·居勒', club: '皇家马德里', v: 4500, tm: '861410' },
  'ellyes skhiri': { zh: '埃莱斯·斯基里', club: '法兰克福', v: 1200 },
  'hannibal mejbri': { zh: '汉尼拔·梅布里', club: '伯恩利', v: 1500, tm: '691609' },
  'yoane wissa': { zh: '约安·维萨', club: '布伦特福德', v: 3500, tm: '388516' },
};

export function lookupPlayer(nameEn) {
  const key = norm(nameEn);
  const base = PLAYER_META[key] || PLAYER_META[key.replace(/\./g, '')];
  const extra = PLAYER_ZH_EXTRA[key] || PLAYER_ZH_EXTRA[key.replace(/\./g, '')];
  if (base && extra?.zh) return { ...base, zh: extra.zh };
  if (base) return base;
  if (extra?.zh) return { zh: extra.zh };
  return null;
}

export function lookupTmId(nameEn) {
  return lookupPlayer(nameEn)?.tm || null;
}
