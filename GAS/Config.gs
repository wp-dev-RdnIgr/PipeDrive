var FIELDS = [
  {key:'pipeline',field_id:12460,label:'Воронка',type:'pipeline',operators:['=','!=']},
  {key:'stage_id',field_id:12462,label:'Етап',type:'stage',operators:['=','!=','IN']},
  {key:'status',field_id:12464,label:'Стан',type:'status',operators:['=','!='],options:[{id:'open',label:'Відкрита'},{id:'won',label:'Виграна'},{id:'lost',label:'Програна'}]},
  {key:'user_id',field_id:12455,label:'Власник',type:'user',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'creator_user_id',field_id:12454,label:'Автор',type:'user',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'add_time',field_id:12465,label:'Дата створення',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'update_time',field_id:12466,label:'Дата оновлення',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'won_time',field_id:12470,label:'Дата виграшу',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'lost_time',field_id:12473,label:'Дата програшу',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'close_time',field_id:12474,label:'Дата закриття',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'expected_close_date',field_id:12484,label:'Очікувана дата закриття',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'value',field_id:12456,label:'Вартість',type:'monetary',operators:['=','!=','>','<','>=','<=','IS NULL','IS NOT NULL']},
  {key:'title',field_id:12453,label:'Заголовок',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'label',field_id:12463,label:'Мітка',type:'set',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:22,label:'Україна'},{id:23,label:'Казахстан'},{id:59,label:'Акаунт Андрусяк'},{id:60,label:'Акаунт Насті'},{id:61,label:'Акаунт Лени'}]},
  {key:'lost_reason',field_id:12475,label:'Причина програшу',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:28,label:'Спам'},{id:86,label:'Розблокування фб'},{id:45,label:'Нерелевантний по задачі'},{id:111,label:'Дубль заявки'},{id:52,label:'Не відповідає, ігнор'},{id:27,label:'Відмовились від прийняття рішення'},{id:29,label:'Відклали прийняття рішення'},{id:25,label:'Дорого'},{id:26,label:'Обрали конкурента'},{id:40,label:'Робочі комунікації'},{id:44,label:'Присутній в расеє'},{id:88,label:'В обробці КЗ'},{id:112,label:'Інше'}]},
  {key:'org_id',field_id:12459,label:'Організація',type:'varchar',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'person_id',field_id:12461,label:'Контактна особа',type:'varchar',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'probability',field_id:12458,label:'Імовірність',type:'int',operators:['=','>','<','>=','<=','IS NULL','IS NOT NULL']},
  {key:'origin',field_id:12519,label:'Джерело походження',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:'ManuallyCreated',label:'Створений вручну'},{id:'Import',label:'Імпорт'},{id:'API',label:'API'},{id:'Automation',label:'Автоматизація'},{id:'WebForms',label:'Вебформи'},{id:'Chatbot',label:'Чат-бот'},{id:'LiveChat',label:'Онлайн-чат'},{id:'Campaigns',label:'Campaigns'}]},
  {key:'channel',field_id:12521,label:'Канал походження',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:100,label:'Web forms'},{id:101,label:'Chatbot'},{id:102,label:'Live chat'},{id:104,label:'Campaigns'},{id:106,label:'Messaging Inbox'}]},
  // Custom fields
  {key:'e664cf54795851840003239fba6262f7bb35ecba',field_id:12497,label:'Якість ліда',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:48,label:'Нерелеватний'},{id:49,label:'Marketing Qualified Lead'},{id:37,label:'Sales Qualified Lead'},{id:109,label:'Невизначений лід'},{id:110,label:'Дубль заявки'}]},
  {key:'c0a6991f8b97eb6fad1d19dbf26ca32b8ff78760',field_id:12504,label:'Позиція клієнта',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:50,label:'Маркетолог'},{id:51,label:'Власник'}]},
  {key:'1338d3a3ecb513d7a68a32b5439872eb08c2a366',field_id:12496,label:'Джерело (форма)',type:'set',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:30,label:'Форма зворотнього звʼязку'},{id:31,label:'Форма Відправити заявку'},{id:32,label:'Форма Контекстна реклама'},{id:33,label:'Форма в футері'},{id:43,label:'Дзвінок'},{id:53,label:'Соціальні мережі'},{id:54,label:'Пошта Info'},{id:65,label:'referral_YK'},{id:66,label:'referral_AV'},{id:67,label:'referral_WE'},{id:68,label:'referral_OD'},{id:108,label:'referral_OZh'},{id:87,label:'Інтервью'},{id:90,label:'New Business'},{id:91,label:'Referral Sales Manager'}]},
  {key:'edd70f6d7138760fca5573f6f84868303eb6b38c',field_id:12515,label:'Оброблено',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:92,label:'Вчасно'},{id:93,label:'З запізненням'},{id:94,label:'Очікує'}]},
  {key:'b89035f86a699ca59229900f42ab9f627017b871',field_id:12498,label:'Перенесена з холодної',type:'enum',operators:['=','!=','IS NULL','IS NOT NULL'],options:[{id:41,label:'Так'},{id:42,label:'Ні'}]},
  {key:'bc6cb2be2fa86156a9da36476ee00526badce9b1',field_id:12485,label:'Назва проєкту',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'a600f66ee681cdbadd255ed1c5d3a1eef6fb1490',field_id:12493,label:'Назва сайту',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'50b777b7baa179cee7c06d63d50b1338887285ce',field_id:12499,label:'Utm Source',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'d3427cdd75f047b75c5ea754c9b4231b38be32c8',field_id:12500,label:'Utm Medium',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'c5accf0005ddb2f09157fcca17861081f77aa9b6',field_id:12501,label:'Utm Campaign',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'3ba2f19f206260c0489fa4b4de617c987b643b84',field_id:12502,label:'Utm Term',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'656372fbcf67f6352ea6bec1ca2c3eba7429f3a6',field_id:12503,label:'Utm Content',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'b3a97cc3db5a88f752797d1ac360952d0d3632a0',field_id:12508,label:'Сторінка сайту',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'fbe73c1a96bd4170123745b5fd9a44f9a88438da',field_id:12489,label:'Коментар',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'64ae14d237e29fe0796b6d88e3c86ffd34c50b8e',field_id:12527,label:'Посилання на КП',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'2f11d1175b4233f85c7e528d4422d2552f9feda8',field_id:12512,label:'Дата призначення якості ліда',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'2ffacb7fa77a1138b46c1180354d1702ddd68227',field_id:12488,label:'Контрольна дата',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'f234ca843d48767041ad9a953efe88601b262baa',field_id:12492,label:'Коли звʼязатись',type:'date',operators:['>=','<=','IS NULL','IS NOT NULL']},
  {key:'9bebbce4608524905ffc0545a90ce33dbf51c0d3',field_id:12494,label:'utm (старе поле)',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'d6c8ca444e27e837b3626348ff276e3e89c48276',field_id:12514,label:'Телефон webpromo',type:'varchar',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'product_name',field_id:12511,label:'Назва товару',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']},
  {key:'85db618371dc3846bfea15394ba2d10517b74fdb',field_id:12528,label:'Спеціаліст, що готував КП',type:'user',operators:['=','!=','IS NULL','IS NOT NULL']},
  {key:'f7a0e3a62e0d735f31b90feb7530ffa6403cfcd0',field_id:12529,label:'Коментар по програшу',type:'varchar',operators:['=','!=','LIKE','IS NULL','IS NOT NULL']}
];

var PIPELINES = [
  {id:2,name:'Теплі ліди'},{id:3,name:'Холодні Linkedin WP'},{id:7,name:'Холодні продажі UA'},
  {id:4,name:'Робота з партнерами'},{id:11,name:'Передтендерна воронка'},{id:5,name:'Календар тендерів'},
  {id:6,name:'Тендерні угоди в роботі'},{id:9,name:'Холодні продажі КЗ'},{id:12,name:'Nowy lejek'}
];

var STAGES = {
  2:[{id:6,name:'Необроблені ліди'},{id:49,name:'В обробці'},{id:7,name:'Дебрифінг'},{id:8,name:'Підготовка пропозицій'},{id:9,name:'Презентація пропозицій'},{id:10,name:'Прийняття рішення'},{id:11,name:'Підготовка договору'},{id:12,name:'Отримання оплати'},{id:13,name:'Відкладено'},{id:14,name:'Старт проекту'}],
  3:[{id:48,name:'Потенційні компанії'},{id:50,name:'Відправлено запит'},{id:51,name:'Встановлено контакт'},{id:15,name:'1 контакт'},{id:16,name:'2 контакт'},{id:17,name:'3 контакт'},{id:57,name:'Розпочато діалог'},{id:56,name:'Назначена зустріч'},{id:24,name:'Відкладено'}],
  7:[{id:136,name:'Сайт знайдений'},{id:107,name:'Раніше звертались'},{id:58,name:'База конференції'},{id:141,name:'Відсортовані'},{id:59,name:'Розпочато комунікацію'},{id:60,name:'Фолловап 1'},{id:69,name:'Отримано відповідь'},{id:137,name:'Дружба'},{id:75,name:'Написати пізніше'},{id:68,name:'Назначена зустріч'},{id:138,name:'Зустріч відбулась'}],
  4:[{id:26,name:'Перший контакт'},{id:27,name:'Другий контакт'},{id:28,name:'Третій контакт'},{id:29,name:'Дебрифінг'},{id:30,name:'Підготовка пропозицій'},{id:31,name:'Презентація пропозицій'},{id:33,name:'Прийняття рішення'},{id:32,name:'Підготовка договору'},{id:34,name:'Отримання оплати'},{id:35,name:'Відкладено'},{id:36,name:'Старт проекту'}],
  11:[{id:130,name:'Планові компанії'},{id:131,name:'Надіслане повідомлення'},{id:132,name:'Розпочато діалог'},{id:133,name:'Планові комунікації'},{id:134,name:'Назначена дата тендеру'}],
  5:[{id:135,name:'Нерозподілені тендери'}],
  6:[{id:40,name:'Дебрифінг'},{id:41,name:'Підготовка пропозицій'},{id:42,name:'Презентація пропозицій'},{id:43,name:'Прийняття рішення'},{id:44,name:'Підготовка договору'},{id:45,name:'Отримання оплати'},{id:46,name:'Відкладено'},{id:47,name:'Старт проекту'}],
  9:[{id:99,name:'Сайт найден'},{id:100,name:'Раніше обращались'},{id:101,name:'База конференции'},{id:142,name:'Відсортовані'},{id:140,name:'Начата коммуникация'},{id:102,name:'Фолловап 1'},{id:103,name:'Получен ответ'},{id:104,name:'Дружба'},{id:106,name:'Отложено'},{id:105,name:'Назначена встреча'},{id:139,name:'Встреча состоялась'}],
  12:[{id:143,name:'Zakwalifikowano'},{id:144,name:'Nawiązano kontakt'},{id:145,name:'Zaplanowano demo'},{id:146,name:'Złożono ofertę'},{id:147,name:'Rozpoczęto negocjacje'}]
};

var USERS = [
  {id:18752499,name:'Anastasiia Khmaruk',active:true},{id:15621800,name:'Andrii Shyshov',active:true},
  {id:13435531,name:'CRMiUM',active:true},{id:22953971,name:'Karina Tkach',active:true},
  {id:15621877,name:'Kateryna Lifyrenko',active:true},{id:15323755,name:'Kirill Andrusiak',active:true},
  {id:15621822,name:'Klimantovych Helena',active:true},{id:15251232,name:'OLEKSANDR POLISHCHUK',active:true},
  {id:14760236,name:'Olya Astakhova',active:true},{id:22023250,name:'Анастасія Буланок',active:true},
  {id:25170047,name:'Євген Омельяненко',active:true},{id:15788989,name:'Кани Маржан',active:true},
  {id:24012413,name:'Федір',active:true},
  {id:15621855,name:'Alexander Kravets',active:false},{id:15621811,name:'Anzhelika',active:false},
  {id:17480184,name:'Bohdan',active:false},{id:19780834,name:'Daniil Serzhan',active:false},
  {id:24012424,name:'Illia Somin',active:false},{id:22954092,name:'Oleksandr Piturenko',active:false},
  {id:17614516,name:'Pavlo Halas',active:false},{id:19004762,name:'Sergey Orliuk',active:false},
  {id:15621844,name:'Svitlana Marchuk',active:false},{id:17219495,name:'v.blazhko',active:false},
  {id:15621833,name:'Yurii Stetsenko',active:false},{id:15323733,name:'Yuriy Kopishinskyi',active:false},
  {id:15621866,name:'Віталій Диблюк',active:false}
];

var OPERATORS_LABELS = {'=':'дорівнює','!=':'не дорівнює','>':'більше','<':'менше','>=':'від (включно)','<=':'до (включно)','LIKE':'містить','IS NULL':'порожнє','IS NOT NULL':'не порожнє','IN':'один із'};

function getFieldsConfig(){return FIELDS;}
function getPipelinesConfig(){return PIPELINES;}
function getUsersConfig(){return USERS;}
function getStagesForPipeline(pid){return STAGES[pid]||[];}
function getAllStages(){return STAGES;}
function getOperatorsLabels(){return OPERATORS_LABELS;}

var PRESET_REPORTS = [
  {
    id:'commercial_proposals',
    name:'Комерційні пропозиції',
    icon:'КП',
    description:'Воронка КП, причини програшу, конверсія менеджерів',
    enhanced:true,
    funnelStages:[
      {id:8,name:'Підготовка пропозицій'},
      {id:9,name:'Презентація пропозицій'},
      {id:10,name:'Прийняття рішення'},
      {id:13,name:'Відкладено'},
      {id:11,name:'Підготовка договору'},
      {id:14,name:'Старт проекту'}
    ],
    andConditions:[
      {field_id:12463,operator:'IS NOT NULL',value:''},
      {field_id:12465,operator:'>=',value:''},
      {field_id:12493,operator:'IS NOT NULL',value:''},
      {field_id:12511,operator:'IS NOT NULL',value:''},
      {field_id:12500,operator:'IS NOT NULL',value:''},
      {field_id:12455,operator:'IS NOT NULL',value:''},
      {field_id:12497,operator:'=',value:37},
      {field_id:12456,operator:'IS NOT NULL',value:''},
      {field_id:12528,operator:'IS NOT NULL',value:''},
      {field_id:12527,operator:'IS NOT NULL',value:''},
      {field_id:12496,operator:'IS NOT NULL',value:''},
      {field_id:12501,operator:'IS NOT NULL',value:''},
      {field_id:12499,operator:'IS NOT NULL',value:''},
      {field_id:12508,operator:'IS NOT NULL',value:''},
      {field_id:12475,operator:'IS NOT NULL',value:''},
      {field_id:12529,operator:'IS NOT NULL',value:''}
    ],
    orConditions:[
      {field_id:12462,operator:'=',value:8},
      {field_id:12462,operator:'=',value:9},
      {field_id:12462,operator:'=',value:10},
      {field_id:12462,operator:'=',value:13},
      {field_id:12462,operator:'=',value:11},
      {field_id:12462,operator:'=',value:14}
    ],
    sheetFilters:[
      {field:'c_lead_quality',op:'=',value:'37'},
      {field:'stage_id',op:'in',value:[8,9,10,13,11,14]}
    ],
    columns:[
      {key:'title',label:'Назва угоди',deal_link:true,width:220,truncate:true},
      {key:'label',label:'Країна',lookup:12463,width:110},
      {key:'add_time',label:'Дата ліда',date:true,width:100},
      {key:'org_name',label:'Сайт компанії',width:180,truncate:true},
      {key:'product_name',label:'Назва товару',width:140,truncate:true},
      {key:'c_utm_medium',label:'Канал (Utm Medium)',width:150,truncate:true},
      {key:'owner_name',label:'Менеджер',width:140,truncate:true},
      {key:'c_lead_quality',label:'Статус ліда',lookup:12497,width:110},
      {key:'stage_name',label:'Етап',width:150,truncate:true},
      {key:'value',label:'Сума угоди',money:true,width:110},
      {key:'c_kp_specialist',label:'Спеціаліст, що готував КП',width:160,truncate:true},
      {key:'c_kp_link',label:'Лінк на презентацію',external_link:true,width:130},
      {key:'c_source_form',label:'Джерело',lookup:12496,width:160,truncate:true},
      {key:'c_utm_campaign',label:'Угода - Utm Campaign',width:160,truncate:true},
      {key:'c_utm_source',label:'Угода - Utm Source',width:150,truncate:true},
      {key:'c_site_page',label:'Угода - Сторінка сайту',external_link:true,width:150},
      {key:'lost_reason',label:'Причина програшу',width:160,truncate:true},
      {key:'c_loss_comment',label:'Коментар по програшу',width:200,expandable:true}
    ],
    description:'Воронка КП, причини програшу, конверсія менеджерів'
  },
  {
    id:'project_starts',
    name:'Старт проєктів',
    icon:'СП',
    description:'Угоди на стадії старту проекту у всіх воронках',
    enhanced:false,
    chartMode:'count',
    andConditions:[
      {field_id:12463,operator:'IS NOT NULL',value:''},
      {field_id:12465,operator:'>=',value:''},
      {field_id:12459,operator:'IS NOT NULL',value:''},
      {field_id:12511,operator:'IS NOT NULL',value:''},
      {field_id:12500,operator:'IS NOT NULL',value:''},
      {field_id:12455,operator:'IS NOT NULL',value:''},
      {field_id:12456,operator:'IS NOT NULL',value:''},
      {field_id:12496,operator:'IS NOT NULL',value:''},
      {field_id:12501,operator:'IS NOT NULL',value:''},
      {field_id:12499,operator:'IS NOT NULL',value:''}
    ],
    orConditions:[
      {field_id:12462,operator:'=',value:14},
      {field_id:12462,operator:'=',value:36},
      {field_id:12462,operator:'=',value:47}
    ],
    sheetFilters:[
      {field:'stage_id',op:'in',value:[14,36,47]}
    ],
    columns:[
      {key:'title',label:'Назва угоди',deal_link:true,width:220,truncate:true},
      {key:'label',label:'Країна',lookup:12463,width:110},
      {key:'add_time',label:'Дата ліда',date:true,width:100},
      {key:'org_name',label:'Сайт компанії',width:180,truncate:true},
      {key:'product_name',label:'Назва товару',width:140,truncate:true},
      {key:'c_utm_medium',label:'Канал (Utm Medium)',width:150,truncate:true},
      {key:'owner_name',label:'Менеджер',width:140,truncate:true},
      {key:'stage_name',label:'Етап',width:150,truncate:true},
      {key:'value',label:'Сума угоди',money:true,width:110},
      {key:'c_source_form',label:'Джерело',lookup:12496,width:160,truncate:true},
      {key:'c_utm_campaign',label:'Utm Campaign',width:140,truncate:true},
      {key:'c_utm_source',label:'Utm Source',width:120,truncate:true}
    ]
  },
  {
    id:'tenders',
    name:'Тендери',
    icon:'ТН',
    description:'Тендерні угоди: воронка, причини програшу, коментарі',
    enhanced:true,
    funnel:true,
    avgStageTime:true,
    chartMode:'count',
    funnelStages:[
      {id:41,name:'Підготовка пропозицій'},
      {id:42,name:'Презентація пропозицій'},
      {id:43,name:'Прийняття рішення'},
      {id:46,name:'Відкладено'},
      {id:44,name:'Підготовка договору'},
      {id:47,name:'Старт проекту'}
    ],
    andConditions:[
      {field_id:12463,operator:'IS NOT NULL',value:''},
      {field_id:12465,operator:'>=',value:''},
      {field_id:12474,operator:'>=',value:''},
      {field_id:12459,operator:'IS NOT NULL',value:''},
      {field_id:12511,operator:'IS NOT NULL',value:''},
      {field_id:12455,operator:'IS NOT NULL',value:''},
      {field_id:12456,operator:'IS NOT NULL',value:''},
      {field_id:12527,operator:'IS NOT NULL',value:''},
      {field_id:12475,operator:'IS NOT NULL',value:''},
      {field_id:12529,operator:'IS NOT NULL',value:''}
    ],
    orConditions:[
      {field_id:12462,operator:'=',value:41},
      {field_id:12462,operator:'=',value:42},
      {field_id:12462,operator:'=',value:43},
      {field_id:12462,operator:'=',value:46},
      {field_id:12462,operator:'=',value:44},
      {field_id:12462,operator:'=',value:47}
    ],
    sheetFilters:[
      {field:'pipeline_id',op:'=',value:'6'},
      {field:'stage_id',op:'in',value:[41,42,43,44,46,47]}
    ],
    columns:[
      {key:'title',label:'Назва угоди',deal_link:true,width:220,truncate:true},
      {key:'label',label:'Країна',lookup:12463,width:110},
      {key:'add_time',label:'Дата заведення ліда',date:true,width:110},
      {key:'close_time',label:'Дата фінального статусу',date:true,width:130},
      {key:'org_name',label:'Сайт компанії',width:180,truncate:true},
      {key:'product_name',label:'Назва товару',width:140,truncate:true},
      {key:'owner_name',label:'Менеджер',width:140,truncate:true},
      {key:'stage_name',label:'Етап',width:150,truncate:true},
      {key:'value',label:'Сума угоди',money:true,width:110},
      {key:'c_kp_link',label:'Лінк на презентацію',external_link:true,width:120},
      {key:'lost_reason',label:'Причина програшу',width:150,truncate:true},
      {key:'c_loss_comment',label:'Коментар по програшу',width:180,expandable:true}
    ]
  }
];
function getPresetReports(){return PRESET_REPORTS;}
