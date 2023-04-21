export  class Registro{
    public format:string;
    public text:string;
    public type:string;
    public icon:string;
    public created:Date;
    constructor( format:string,text:string){
        this.format=format;
        this.text=text;
        this.created=new Date();
        this.type='';
        this.icon='';
        this.getType();
    }
    private getType(){
        if(this.text.search('goo.gl/maps')!==-1){
            this.type='gmap';
            this.icon='map';
        }else{
            const tipo = this.text.substring(0,4);
            console.log('TIPO',tipo);
            switch (tipo) {
                case 'http':
                    this.type='http';
                    this.icon='globe';
                    break;
                case 'geo:':
                    this.type='geo';
                    this.icon='pin';
                    break;
                case 'WIFI':
                    this.type='wifi';
                    this.icon='wifi';
                    break;
                default:
                    this.type='undefined'
                    this.icon='document';
                    break;
            }
        }
    }
}