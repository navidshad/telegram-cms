module.exports.category = {
    modulename:'category',
    asoption : 'منو',
    //admin
    name:'🗂 '+'منو ساز',
    back:'⤴️ برگش به منو مطالب',
    message:'لطفا منو که میخواهید این قابلیت در آن نمایش داده ود را انتخاب کنید.',
    maincategory: 'دسته اصلی',  //don't change it, it has been stored in categories collection
    categoryoptions: ['📝 ویرایش دسته های فعلی', '✏️ افزودن دسته'],
    
    endAttach:'اتمام پیوست',
    backtoParent:'بازگشت به منوی قبل 🔙',
    
    edit:{
        name:'لطفا نام جدید منو را ارسال کنید.',
        parent:'لطفا منو مادر را انتخاب کنید.',
        description:'لطفا توضیحات منو را انتخاب کنید.',
        order:'لطفا اولویت منو را با عدد مشخص کنید. ترتیب محصولات و منو ها هنگامی که لیست میشوند بر اساس این اعداد است.',
        attach:'لطفا فایل های پیوست خود را ارسال کنید، این فایل ها پس از ورود به این منو برای کاربر ارسال میشوند.'
    },

    //query
    queryCategory           :'category',
    queryCategoryName       :'name',
    queryCategoryParent     :'parent',
    queryCategoryDescription:'description',
    queryOrder              :'order',
    queryDelete             :'del',
    
    attach                  :'atting',
    attachment              :'att',
    removeAttachment        :'ratt',
}