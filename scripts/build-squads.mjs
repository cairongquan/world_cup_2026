#!/usr/bin/env node
/** 从公开报道整理 2026 世界杯阵容，生成 data/squads.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'squads.json');

/** @type {Record<string, object>} */
const teams = {
  墨西哥: {
    coach: 'Javier Aguirre', coachZh: '哈维尔·阿吉雷', squadStatus: 'provisional',
    goalkeepers: ['Guillermo Ochoa', 'Carlos Acevedo', 'Raúl Rangel'],
    defenders: ['Edson Álvarez', 'Johan Vásquez', 'César Montes', 'Julián Araujo'],
    midfielders: ['Luis Chávez', 'Orbelin Pineda', 'Carlos Rodríguez', 'Obed Vargas'],
    forwards: ['Raúl Jiménez', 'Santiago Giménez', 'César Huerta', 'Germán Berterame'],
  },
  南非: {
    coach: 'Hugo Broos', coachZh: '雨果·布罗奥斯', squadStatus: 'pending',
    note: '正式 26 人名单计划于 5 月 27 日公布',
    keyPlayers: ['Ronwen Williams', 'Percy Tau', 'Themba Zwane', 'Teboho Mokoena'],
  },
  捷克: {
    coach: 'Miroslav Koubek', coachZh: '米罗斯拉夫·库贝克', squadStatus: 'provisional',
    goalkeepers: ['Antonín Kinsky', 'Matěj Kovář', 'Jindřich Staněk'],
    defenders: ['Vladimír Coufal', 'Robin Hranáč', 'David Zima', 'Ladislav Krejčí'],
    midfielders: ['Tomáš Souček', 'Lukáš Provod', 'Pavel Šulc', 'Michal Sadílek'],
    forwards: ['Patrik Schick', 'Adam Hložek', 'Jan Kuchta', 'Matěj Vydra'],
  },
  哥伦比亚: {
    coach: 'Néstor Lorenzo', coachZh: '内斯托尔·洛伦佐', squadStatus: 'provisional',
    note: '2026-05-14 公布 55 人初选，正式 26 人计划于 6/1 公布',
    goalkeepers: ['David Ospina', 'Camilo Vargas', 'Kevin Mier'],
    defenders: ['Davinson Sánchez', 'Daniel Muñoz', 'Yerry Mina', 'Jhon Lucumí', 'Santiago Arias', 'Johan Mojica'],
    midfielders: ['James Rodríguez', 'Jefferson Lerma', 'Richard Ríos', 'Juan Cuadrado', 'Wilmar Barrios', 'Jhon Arias'],
    forwards: ['Luis Díaz', 'Rafael Borré', 'Cucho Hernández', 'Jhon Durán'],
  },
  乌兹别克: {
    coach: 'Fabio Cannavaro', coachZh: '法比奥·卡纳瓦罗', squadStatus: 'provisional',
    note: '2026-05-05 公布 40 人初选名单（下列为核心球员）',
    goalkeepers: ['Utkir Yusupov', 'Abduvokhid Nematov', 'Botirali Ergashev'],
    defenders: ['Rustam Ashurmatov', 'Farrukh Sayfiev', 'Khojiakbar Alijonov', 'Umar Eshmurodov', 'Abdukodir Khusanov', 'Sherzod Nasrullaev', 'Ibrokhimkhalil Yuldoshev'],
    midfielders: ['Otabek Shukurov', 'Odiljon Hamrobekov', 'Jamshid Iskanderov', 'Jasurbek Jaloliddinov', 'Akmal Mozgovoy', 'Abbosek Fayzullaev'],
    forwards: ['Eldor Shomurodov', 'Igor Sergeev', 'Jaloliddin Masharipov', 'Dostonbek Khamdamov', 'Oston Urunov'],
  },
  韩国: {
    coach: 'Hong Myung-bo', coachZh: '洪明甫', squadStatus: 'final',
    note: '2026-05-15 公布正式 26 人名单',
    goalkeepers: ['Kim Seung-gyu', 'Jo Hyeon-woo', 'Song Bum-keun'],
    defenders: ['Kim Min-jae', 'Lee Han-beom', 'Seol Young-woo', 'Kim Tae-hyeon', 'Jens Castrop', 'Kim Moon-hwan', 'Park Jin-seob', 'Lee Ki-hyuk', 'Lee Tae-seok', 'Cho Yu-min'],
    midfielders: ['Lee Kang-in', 'Lee Jae-sung', 'Hwang Hee-chan', 'Hwang In-beom', 'Paik Seung-ho', 'Bae Jun-ho', 'Kim Jin-gyu', 'Yang Hyun-jun', 'Eom Ji-sung', 'Lee Dong-gyeong'],
    forwards: ['Son Heung-min', 'Cho Gue-sung', 'Oh Hyeon-gyu'],
  },
  '刚果(金)': {
    coach: 'Sébastien Desabre', coachZh: '塞巴斯蒂安·德萨布雷', squadStatus: 'final',
    note: '2026-05-18 公布正式 26 人名单',
    goalkeepers: ['Lionel Mpasi', 'Timothy Fayulu', 'Matthieu Epolo'],
    defenders: ['Chancel Mbemba', 'Arthur Masuaku', 'Gédéon Kalulu', 'Joris Kayembe', 'Dylan Batubinsika', 'Axel Tuanzebe', 'Aaron Wan-Bissaka', 'Rocky Bushiri', 'Steve Kapuadi'],
    midfielders: ['Meschak Elia', 'Samuel Moutoussamy', 'Edo Kayembe', 'Charles Pickel', 'Gaël Kakuta', 'Noah Sadiki', 'Nathanaël Mbuku', "Ngal'ayel Mukau", 'Brian Cipenga'],
    forwards: ['Cédric Bakambu', 'Théo Bongonda', 'Fiston Mayele', 'Yoane Wissa', 'Simon Banza'],
  },
  西班牙: {
    coach: 'Luis de la Fuente', coachZh: '路易斯·德拉富恩特', squadStatus: 'pending',
    note: '正式名单计划于 5 月 25 日公布',
    keyPlayers: ['Pedri', 'Lamine Yamal', 'Rodri', 'Álvaro Morata', 'Unai Simón'],
  },
  乌拉圭: {
    coach: 'Marcelo Bielsa', coachZh: '马塞洛·贝尔萨', squadStatus: 'pending',
    keyPlayers: ['Darwin Núñez', 'Federico Valverde', 'Ronald Araújo', 'Giorgian Arrascaeta'],
  },
  佛得角: {
    coach: 'Bubista', coachZh: '布比斯塔', squadStatus: 'final',
    goalkeepers: ['Vozinha', 'Marcio Rosa', 'Carlos Santos'],
    defenders: ['Stopira', 'Logan Costa', 'Steven Moreira', 'Roberto Lopes'],
    midfielders: ['Jamiro Monteiro', 'Kevin Pina', 'Deroy Duarte', 'Laros Duarte'],
    forwards: ['Ryan Mendes', 'Garry Rodrigues', 'Gilson Tavares', 'Nuno da Costa'],
  },
  沙特: {
    coach: 'Georgios Donis', coachZh: '乔治奥斯·多尼斯', squadStatus: 'pending',
    keyPlayers: ['Salem Al-Dawsari', 'Saud Abdulhamid', 'Firas Al-Buraikan'],
  },
  海地: {
    coach: 'Sébastien Migné', coachZh: '塞巴斯蒂安·米涅', squadStatus: 'final',
    note: '2026-05-15 公布正式 26 人名单',
    goalkeepers: ['Johny Placide', 'Alexandre Pierre', 'Josué Duverger'],
    defenders: ['Ricardo Adé', 'Carlens Arcus', 'Martin Expérience', 'Jean-Kévin Duverne', 'Duke Lacroix', 'Wilguens Paugain', 'Hannes Delcroix', 'Keeto Thermoncy'],
    midfielders: ['Leverton Pierre', 'Danley Jean Jacques', 'Carl Sainté', 'Jean-Ricner Bellegarde', 'Woodensky Pierre', 'Dominique Simon'],
    forwards: ['Duckens Nazon', 'Frantzdy Pierrot', 'Derrick Etienne Jr.', 'Louicius Deedson', 'Ruben Providence', 'Josué Casimir', 'Yassin Fortuné', 'Wilson Isidor', 'Lenny Joseph'],
  },
  摩洛哥: {
    coach: 'Mohamed Ouahbi', coachZh: '穆罕默德·瓦赫比', squadStatus: 'pending',
    note: '正式名单计划于 5 月 26 日公布（维基）',
    keyPlayers: ['Achraf Hakimi', 'Youssef En-Nesyri', 'Brahim Díaz', 'Sofyan Amrabat'],
  },
  波黑: {
    coach: 'Sergej Barbarez', coachZh: '塞尔日·巴巴雷兹', squadStatus: 'final',
    note: '2026-05-11 公布正式 26 人名单',
    goalkeepers: ['Nikola Vasilj', 'Martin Zlomislić', 'Osman Hadžikić'],
    defenders: ['Sead Kolašinac', 'Dennis Hadžikadunić', 'Amar Dedić', 'Nikola Katić', 'Tarik Muharemović', 'Nihad Mujakić', 'Stjepan Radeljić', 'Nidal Čelik'],
    midfielders: ['Amir Hadžiahmetović', 'Benjamin Tahirović', 'Armin Gigović', 'Dženis Burnić', 'Ivan Bašić', 'Esmir Bajraktarević', 'Amar Memić', 'Ivan Šunjić', 'Kerim Alajbegović', 'Ermin Mahmić'],
    forwards: ['Edin Džeko', 'Ermedin Demirović', 'Samed Baždar', 'Haris Tabaković', 'Jovo Lukić'],
  },
  加拿大: {
    coach: 'Jesse Marsch', coachZh: '杰西·马什', squadStatus: 'pending',
    note: '正式名单计划于 5 月 29 日公布',
    keyPlayers: ['Alphonso Davies', 'Jonathan David', 'Tajon Buchanan', 'Stephen Eustáquio'],
  },
  瑞士: {
    coach: 'Murat Yakin', coachZh: '穆拉特·雅金', squadStatus: 'pending',
    note: '正式名单计划于 5 月 20 日公布',
    keyPlayers: ['Granit Xhaka', 'Manuel Akanji', 'Breel Embolo', 'Xherdan Shaqiri'],
  },
  巴拿马: {
    coach: 'Thomas Christiansen', coachZh: '托马斯·克里斯蒂安森', squadStatus: 'pending',
    note: '正式名单计划于 5 月 26 日公布',
    keyPlayers: ['José Fajardo', 'Adalberto Carrasquilla', 'Aníbal Godoy'],
  },
  加纳: {
    coach: 'Carlos Queiroz', coachZh: '卡洛斯·奎罗斯', squadStatus: 'pending',
    keyPlayers: ['Mohammed Kudus', 'Thomas Partey', 'Inaki Williams', 'Jordan Ayew'],
  },
  科特迪瓦: {
    coach: 'Emerse Faé', coachZh: '埃默塞·法埃', squadStatus: 'final',
    goalkeepers: ['Yahia Fofana', 'Alban Lafont', 'Mohamed Koné'],
    defenders: ['Odilon Kossounou', 'Evan Ndicka', 'Wilfried Singo', 'Ousmane Diomandé'],
    midfielders: ['Franck Kessié', 'Ibrahim Sangaré', 'Seko Fofana', 'Jean-Mickaël Seri'],
    forwards: ['Nicolas Pépé', 'Amad Diallo', 'Simon Adingra', 'Elye Wahi', 'Ange-Yoan Bonny'],
  },
  德国: {
    coach: 'Julian Nagelsmann', coachZh: '尤利安·纳格尔斯曼', squadStatus: 'pending',
    note: '正式名单计划于 5 月 21 日公布',
    keyPlayers: ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz', 'Joshua Kimmich', 'Manuel Neuer'],
  },
  克罗地亚: {
    coach: 'Zlatko Dalić', coachZh: '兹拉特科·达利奇', squadStatus: 'provisional',
    goalkeepers: ['Dominik Livaković', 'Dominik Kotarski', 'Ivo Pandur'],
    defenders: ['Joško Gvardiol', 'Josip Šutalo', 'Josip Stanišić', 'Duje Ćaleta-Car'],
    midfielders: ['Luka Modrić', 'Mateo Kovačić', 'Mario Pašalić', 'Nikola Vlašić', 'Lovro Majer'],
    forwards: ['Andrej Kramarić', 'Ivan Perišić', 'Ante Budimir', 'Petar Musa'],
  },
  伊拉克: {
    coach: 'Graham Arnold', coachZh: '格雷厄姆·阿诺德', squadStatus: 'pending',
    note: '正式名单计划于 6 月 1 日公布',
    keyPlayers: ['Zaidan Abbas', 'Aymen Dhahir', 'Mohammed Ali'],
  },
  塞内加尔: {
    coach: 'Pape Thiaw', coachZh: '帕普·蒂亚夫', squadStatus: 'pending',
    note: '正式名单计划于 5 月 21 日公布',
    keyPlayers: ['Sadio Mané', 'Nicolas Jackson', 'Kalidou Koulibaly', 'Ismaïla Sarr'],
  },
  卡塔尔: {
    coach: 'Julen Lopetegui', coachZh: '胡伦·洛佩特吉', squadStatus: 'provisional',
    note: '2026-05-12 公布 34 人初选，5/18 扩至 35 人（下列为核心球员）',
    goalkeepers: ['Meshaal Barsham', 'Salah Zakaria', 'Mahmud Abunada'],
    defenders: ['Boualem Khoukhi', 'Pedro Miguel', 'Tarek Salman', 'Bassam Al-Rawi', 'Homam Ahmed', 'Lucas Mendes'],
    midfielders: ['Abdulaziz Hatem', 'Karim Boudiaf', 'Assim Madibo', 'Mohammed Waad', 'Ahmed Fathy', 'Jassem Gaber'],
    forwards: ['Hassan Al-Haydos', 'Akram Afif', 'Almoez Ali', 'Mohammed Muntari', 'Yusuf Abdurisag', 'Edmilson Junior'],
  },
  巴拉圭: {
    coach: 'Gustavo Alfaro', coachZh: '古斯塔沃·阿尔法罗', squadStatus: 'provisional',
    note: '2026-05-12 公布 55 人初选名单（下列为核心球员）',
    goalkeepers: ['Carlos Coronel', 'Gastón Olveira', 'Orlando Gill'],
    defenders: ['Gustavo Gómez', 'Omar Alderete', 'Júnior Alonso', 'Fabián Balbuena', 'Diego León', 'Blas Riveros', 'Juan José Cáceres'],
    midfielders: ['Miguel Almirón', 'Mathias Villasanti', 'Diego Gómez', 'Ramón Sosa', 'Andrés Cubas', 'Braian Ojeda'],
    forwards: ['Antonio Sanabria', 'Julio Enciso', 'Adam Bareiro', 'Óscar Romero', 'Ángel Romero'],
  },
  土耳其: {
    coach: 'Vincenzo Montella', coachZh: '文森佐·蒙特拉', squadStatus: 'provisional',
    note: '2026-05-18 公布 35 人初选名单',
    goalkeepers: ['Uğurcan Çakır', 'Mert Günok', 'Altay Bayındır'],
    defenders: ['Merih Demiral', 'Zeki Çelik', 'Çağlar Söyüncü', 'Ferdi Kadıoğlu', 'Abdülkerim Bardakcı', 'Mert Müldür', 'Ozan Kabak', 'Eren Elmalı'],
    midfielders: ['Hakan Çalhanoğlu', 'Kaan Ayhan', 'Orkun Kökçü', 'İsmail Yüksek', 'Salih Özcan', 'Atakan Karazor'],
    forwards: ['Arda Güler', 'Kenan Yıldız', 'Kerem Aktürkoğlu', 'Barış Alper Yılmaz', 'Yunus Akgün', 'İrfan Can Kahveci'],
  },
  澳大利亚: {
    coach: 'Tony Popovic', coachZh: '托尼·波波维奇', squadStatus: 'pending',
    note: '正式名单计划于 6 月 1 日公布',
    keyPlayers: ['Mathew Ryan', 'Harry Souttar', 'Riley McGree', 'Mitchell Duke'],
  },
  约旦: {
    coach: 'Jamal Sellami', coachZh: '贾迈勒·塞拉米', squadStatus: 'provisional',
    note: '2026-05-17 公布 30 人初选名单',
    goalkeepers: ['Yazeed Abulaila', 'Abdallah Al-Fakhouri', 'Nour Bani Attiah', 'Ahmad Al-Juaidi'],
    defenders: ['Ihsan Haddad', 'Yazan Al-Arab', 'Abdallah Nasib', 'Saed Al-Rosan', 'Husam Abu Dahab', 'Mo Abualnadi', 'Salim Obaid', 'Ahmad Assaf', 'Anas Badawi'],
    midfielders: ['Rajaei Ayed', 'Noor Al-Rawabdeh', 'Ibrahim Sadeh', 'Mohammad Abu Hashish', 'Nizar Al-Rashdan', 'Mohannad Abu Taha', 'Amer Jamous', 'Mohammad Al-Dawoud', 'Yousef Qashi', 'Mohammad Taha'],
    forwards: ['Mousa Al-Taamari', 'Mahmoud Al-Mardi', 'Ali Olwan', 'Mohammad Abu Zrayq', 'Ibrahim Sabra', 'Odeh Al-Fakhouri', 'Ali Azaizeh'],
  },
  奥地利: {
    coach: 'Ralf Rangnick', coachZh: '拉尔夫·朗尼克', squadStatus: 'final',
    goalkeepers: ['Patrick Pentz', 'Alexander Schlager', 'Florian Wiegele'],
    defenders: ['David Alaba', 'Kevin Danso', 'Philipp Lienhart', 'Stefan Posch'],
    midfielders: ['Marcel Sabitzer', 'Christoph Baumgartner', 'Konrad Laimer', 'Florian Grillitsch', 'Nicolas Seiwald'],
    forwards: ['Marko Arnautović', 'Michael Gregoritsch', 'Saša Kalajdžić'],
  },
  阿尔及利亚: {
    coach: 'Vladimir Petrović', coachZh: '弗拉基米尔·彼得罗维奇', squadStatus: 'pending',
    note: '正式名单计划于 5 月 31 日公布',
    keyPlayers: ['Riyad Mahrez', 'Youcef Atal', 'Ismaël Bennacer', 'Amine Gouiri'],
  },
  新西兰: {
    coach: 'Darren Bazeley', coachZh: '达伦·贝兹利', squadStatus: 'final',
    goalkeepers: ['Max Crocombe', 'Alex Paulsen', 'Michael Woud'],
    defenders: ['Liberato Cacace', 'Tyler Bindon', 'Finn Surman', 'Michael Boxall'],
    midfielders: ['Joe Bell', 'Marko Stamenić', 'Ryan Thomas', 'Alex Rufer'],
    forwards: ['Chris Wood', 'Ben Old', 'Callum McCowatt', 'Kosta Barbarouses'],
  },
  伊朗: {
    coach: 'Amir Ghalenoei', coachZh: '阿米尔·加莱诺埃', squadStatus: 'pending',
    note: '正式名单计划于 6 月 1 日公布',
    keyPlayers: ['Mehdi Taremi', 'Sardar Azmoun', 'Alireza Jahanbakhsh', 'Saeid Ezatolahi'],
  },
  比利时: {
    coach: 'Rudi Garcia', coachZh: '鲁迪·加西亚', squadStatus: 'final',
    goalkeepers: ['Thibaut Courtois', 'Senne Lammens', 'Mike Penders'],
    defenders: ['Timothy Castagne', 'Zeno Debast', 'Arthur Theate', 'Maxim De Cuyper'],
    midfielders: ['Kevin De Bruyne', 'Youri Tielemans', 'Amadou Onana', 'Axel Witsel', 'Hans Vanaken'],
    forwards: ['Romelu Lukaku', 'Jeremy Doku', 'Leandro Trossard', 'Charles De Ketelaere'],
  },
  美国: {
    coach: 'Mauricio Pochettino', coachZh: '毛里西奥·波切蒂诺', squadStatus: 'pending',
    note: '正式名单计划于 5 月 26 日公布',
    keyPlayers: ['Christian Pulisic', 'Tyler Adams', 'Weston McKennie', 'Giovanni Reyna'],
  },
  巴西: {
    coach: 'Carlo Ancelotti', coachZh: '卡洛·安切洛蒂', squadStatus: 'final',
    note: '2026-05-18 公布正式 26 人名单',
    goalkeepers: ['Alisson', 'Ederson', 'Weverton'],
    defenders: ['Marquinhos', 'Danilo', 'Alex Sandro', 'Gabriel Magalhães', 'Bremer', 'Wesley', 'Roger Ibañez', 'Douglas Santos', 'Léo Pereira'],
    midfielders: ['Casemiro', 'Lucas Paquetá', 'Bruno Guimarães', 'Fabinho', 'Danilo Santos'],
    forwards: ['Neymar', 'Vinícius Júnior', 'Raphinha', 'Gabriel Martinelli', 'Matheus Cunha', 'Endrick', 'Luiz Henrique', 'Igor Thiago', 'Rayan'],
  },
  法国: {
    coach: 'Didier Deschamps', coachZh: '迪迪埃·德尚', squadStatus: 'final',
    goalkeepers: ['Mike Maignan', 'Brice Samba', 'Robin Risser'],
    defenders: ['William Saliba', 'Jules Koundé', 'Dayot Upamecano', 'Theo Hernández', 'Lucas Hernández'],
    midfielders: ["N'Golo Kanté", 'Aurélien Tchouaméni', 'Adrien Rabiot', 'Warren Zaïre-Emery', 'Manu Koné'],
    forwards: ['Kylian Mbappé', 'Ousmane Dembélé', 'Michael Olise', 'Marcus Thuram', 'Désiré Doué'],
  },
  厄瓜多尔: {
    coach: 'Sebastián Beccacece', coachZh: '塞巴斯蒂安·贝卡切切', squadStatus: 'pending',
    keyPlayers: ['Enner Valencia', 'Moisés Caicedo', 'Pervis Estupiñán', 'Kendry Páez'],
  },
  英格兰: {
    coach: 'Thomas Tuchel', coachZh: '托马斯·图赫尔', squadStatus: 'provisional',
    note: '55 人大名单已提交 FIFA，正式 26 人计划于 5 月 22 日公布',
    keyPlayers: ['Harry Kane', 'Jude Bellingham', 'Phil Foden', 'Declan Rice', 'Bukayo Saka', 'Trent Alexander-Arnold', 'Cole Palmer'],
  },
  苏格兰: {
    coach: 'Steve Clarke', coachZh: '史蒂夫·克拉克', squadStatus: 'final',
    note: '2026-05-19 公布正式 26 人名单',
    goalkeepers: ['Craig Gordon', 'Angus Gunn', 'Liam Kelly'],
    defenders: ['Andy Robertson', 'Grant Hanley', 'Kieran Tierney', 'Scott McKenna', 'Jack Hendry', 'Nathan Patterson', 'Anthony Ralston', 'John Souttar', 'Aaron Hickey', 'Dominic Hyam'],
    midfielders: ['John McGinn', 'Scott McTominay', 'Ryan Christie', 'Kenny McLean', 'Billy Gilmour', 'Lewis Ferguson', 'Ben Gannon-Doak', 'Findlay Curtis'],
    forwards: ['Lyndon Dykes', 'Ché Adams', 'Lawrence Shankland', 'George Hirst', 'Ross Stewart'],
  },
  挪威: {
    coach: 'Ståle Solbakken', coachZh: '斯塔尔·索尔斯克亚', squadStatus: 'pending',
    note: '正式名单计划于 5 月 21 日公布',
    keyPlayers: ['Erling Haaland', 'Martin Ødegaard', 'Alexander Sørloth', 'Sander Berge'],
  },
  库拉索: {
    coach: 'Dick Advocaat', coachZh: '迪克·艾德沃卡特', squadStatus: 'final',
    goalkeepers: ['Tyrick Bodak', 'Eloy Room', 'Trevor Doornbusch'],
    defenders: ['Riechedly Bazoer', 'Sherel Floranus', 'Shurandy Sambo', 'Juriën Gaari'],
    midfielders: ['Leandro Bacuna', 'Tyrese Noslin', 'Godfried Roemeratoe', 'Juninho Bacuna'],
    forwards: ['Cyle Larin', 'Tahith Chong', 'Jürgen Locadia', 'Jearl Margaritha'],
  },
  突尼斯: {
    coach: 'Sabri Lamouchi', coachZh: '萨布里·拉穆奇', squadStatus: 'final',
    goalkeepers: ['Aymen Dahmen', 'Sabri Ben Heesen', 'Abdelmouhib Chamakh'],
    defenders: ['Montassar Talbi', 'Dylan Bronn', 'Ali Abdi', 'Yan Valery'],
    midfielders: ['Ellyes Skhiri', 'Hannibal Mejbri', 'Aïssa Laïdouni', 'Rani Khedira'],
    forwards: ['Elias Achouri', 'Khalil Ayari', 'Sebastian Tounekti', 'Firas Chaouat'],
  },
  日本: {
    coach: 'Hajime Moriyasu', coachZh: '森保一', squadStatus: 'final',
    goalkeepers: ['Zion Suzuki', 'Keisuke Osako', 'Tomoki Hayakawa'],
    defenders: ['Takehiro Tomiyasu', 'Ko Itakura', 'Hiroki Ito', 'Yukinari Sugawara', 'Tsuyoshi Watanabe'],
    midfielders: ['Wataru Endo', 'Takefusa Kubo', 'Ritsu Doan', 'Kaishu Sano', 'Daichi Kamada'],
    forwards: ['Ayase Ueda', 'Daizen Maeda', 'Kōki Ogawa', 'Keito Nakamura'],
  },
  荷兰: {
    coach: 'Ronald Koeman', coachZh: '罗纳德·科曼', squadStatus: 'pending',
    note: '正式名单计划于 5 月 27 日公布',
    keyPlayers: ['Virgil van Dijk', 'Memphis Depay', 'Cody Gakpo', 'Frenkie de Jong', 'Xavi Simons'],
  },
  葡萄牙: {
    coach: 'Roberto Martínez', coachZh: '罗伯托·马丁内斯', squadStatus: 'provisional',
    note: '2026-05-19 前后公布初选/正式名单（下列为Olympics 整理名单）',
    goalkeepers: ['Diogo Costa', 'José Sá', 'Rui Silva'],
    defenders: ['Nuno Mendes', 'João Cancelo', 'Diogo Dalot', 'Rúben Dias', 'Gonçalo Inácio', 'Nélson Semedo', 'Matheus Nunes', 'Tomás Araújo'],
    midfielders: ['Bruno Fernandes', 'Bernardo Silva', 'Vitinha', 'João Neves', 'Rúben Neves'],
    forwards: ['Cristiano Ronaldo', 'Rafael Leão', 'Pedro Neto', 'Francisco Conceição', 'João Félix', 'Gonçalo Ramos'],
  },
  瑞典: {
    coach: 'Graham Potter', coachZh: '格雷厄姆·波特', squadStatus: 'final',
    goalkeepers: ['Viktor Johansson', 'Kristoffer Nordfeldt', 'Jacob Widell Zetterström'],
    defenders: ['Victor Lindelöf', 'Isak Hien', 'Gabriel Gudmundsson', 'Daniel Svensson'],
    midfielders: ['Lucas Bergvall', 'Yasin Ayari', 'Mattias Svanberg', 'Jesper Karlström'],
    forwards: ['Alexander Isak', 'Viktor Gyökeres', 'Anthony Elanga', 'Benjamin Nygren'],
  },
  阿根廷: {
    coach: 'Lionel Scaloni', coachZh: '利昂内尔·斯卡洛尼', squadStatus: 'provisional',
    goalkeepers: ['Emiliano Martínez', 'Geronimo Rulli'],
    defenders: ['Cristian Romero', 'Lisandro Martínez', 'Nicolás Otamendi', 'Nahuel Molina'],
    midfielders: ['Enzo Fernández', 'Alexis Mac Allister', 'Rodrigo De Paul', 'Giovani Lo Celso'],
    forwards: ['Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez', 'Alejandro Garnacho', 'Thiago Almada'],
  },
  埃及: {
    coach: 'Hossam Hassan', coachZh: '侯赛姆·哈桑', squadStatus: 'pending',
    note: '正式名单计划于 5 月 29 日公布',
    keyPlayers: ['Mohamed Salah', 'Omar Marmoush', 'Mohamed Elneny', 'Trézéguet'],
  },
};

const statusLabel = {
  final: '正式名单（26人）',
  provisional: '初选大名单',
  pending: '名单待公布',
};

for (const t of Object.values(teams)) {
  t.squadStatusLabel = statusLabel[t.squadStatus] || t.squadStatus;
}

const data = {
  _meta: {
    description: '2026 FIFA World Cup 球队阵容信息',
    teamCount: Object.keys(teams).length,
    sources: [
      'https://www.olympics.com/en/news/2026-fifa-world-cup-football-teams-squads-players-complete-list',
      'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads',
      'https://www.skysports.com/football/news/11095/13543070/world-cup-2026-squad-lists',
    ],
    note: '数据截至 2026 年 5 月 19 日；已公布正式 26 人名单的球队已对齐官方名单，其余为初选或待公布',
    generatedAt: new Date().toISOString(),
  },
  teams,
};

fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', OUT, Object.keys(teams).length, 'teams');
