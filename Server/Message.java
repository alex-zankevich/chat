public class Message{
    public String name;
    public String message;
    public String id;
    Message(String name,String message,String id){
        this.name = name;
        this.message = message;
        this.id = id;
    }
    public String toString(){
    	return "{\"name\":\"" + this.name + "\",\"message\":\"" + this.message + "\",\"id\":" + this.id + "}";
    }
}