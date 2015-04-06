import com.sun.net.httpserver.*;

import java.io.IOException;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.*;
import java.util.List;

public class NewServer implements HttpHandler{
	private List<Message> history = new ArrayList<Message>();

	public static void main(String[] args){
		if(args.length != 1){
			System.out.println("Usage: java Server port");
		}else{
			try{
				System.out.println("Server is starting ...");
				
				Integer port = Integer.parseInt(args[0]);
				HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
				String serverHost = InetAddress.getLocalHost().getHostAddress();
				System.out.println("http://" + serverHost + ":" + port);

				server.createContext("/chat", new NewServer());
				server.setExecutor(null);
				server.start();
			}catch(IOException e){
				System.out.println(e);
			}
		}
	}

	@Override
	public void handle(HttpExchange httpExchange) throws IOException{
		String response = "";

		if ("GET".equals(httpExchange.getRequestMethod())) {
			response = doGet(httpExchange);
		} else if ("POST".equals(httpExchange.getRequestMethod())) {
			response = doPost(httpExchange);
		} else if ("DELETE".equals(httpExchange.getRequestMethod())){
			response = doDelete(httpExchange);
		} else if ("PUT".equals(httpExchange.getRequestMethod())){
			response = doPut(httpExchange);
		} else {
			response = "Unsupported http method: " + httpExchange.getRequestMethod();
		}

		sendResponse(httpExchange,response);
		return;
	}

	private String doGet(HttpExchange httpExchange){
        //System.out.println(jsonObject.toJSONString());
        JSONObject jsonObject = new JSONObject();	
        jsonObject.put("messages", history);
        return jsonObject.toJSONString();
	}

	private String doPost(HttpExchange httpExchange){
		JSONObject jsonObject = new JSONObject();
		try{
			String messageData = inputStreamToString(httpExchange.getRequestBody());
			JSONObject obj = (JSONObject)(new JSONParser()).parse(messageData.trim());
			Message message = new Message((String)obj.get("name"),(String)obj.get("message"),(String)obj.get("id"));
			history.add(message);
			System.out.println(message.name + " : " +message.message);

				
	        jsonObject.put("messages", history);
	        
		}catch(ParseException pe){
			System.out.println(pe);
		}
		return jsonObject.toJSONString();
	}
	private String doDelete(HttpExchange httpExchange){
		String id = inputStreamToString(httpExchange.getRequestBody());
		for(int i = 0; i < history.size(); i++){
			if((history.get(i).id).equals(id)){
				System.out.println(history.get(i).name + " : " + history.get(i).message +" -- Message deleted!");
				history.remove(i);
				break;
			}
		}

		JSONObject jsonObject = new JSONObject();	
        jsonObject.put("messages", history);
        return jsonObject.toJSONString();
	}
	private String doPut(HttpExchange httpExchange){
		JSONObject jsonObject = new JSONObject();
		try{
			String messageData = inputStreamToString(httpExchange.getRequestBody());
			JSONObject obj = (JSONObject)(new JSONParser()).parse(messageData.trim());
			String id = (String)obj.get("id");
			String newMessage = (String)obj.get("newMessage");
			for(int i = 0; i < history.size(); i++){
				if((history.get(i).id).equals(id)){
					System.out.println("Message : " + history.get(i).name + " : " + history.get(i).message +" -- Message edited! ==>");
					history.get(i).message = newMessage;
					System.out.println("New message is : " + history.get(i).name + " : " + history.get(i).message);
					break;
				}
			}
				
	        jsonObject.put("messages", history);
	        
		}catch(ParseException pe){
			System.out.println(pe);
		}
		return jsonObject.toJSONString();
	}
	private String inputStreamToString(InputStream in) {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int length = 0;
		try {
			while ((length = in.read(buffer)) != -1) {
				baos.write(buffer, 0, length);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return new String(baos.toByteArray());
	}

	private void sendResponse(HttpExchange httpExchange, String response) {
		try {
			byte[] bytes = response.getBytes();
			Headers headers = httpExchange.getResponseHeaders();
			headers.add("Access-Control-Allow-Origin","*");
			headers.add("Access-Control-Allow-Methods","GET, POST, DELETE, PUT, OPTIONS");
			headers.add("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
			httpExchange.sendResponseHeaders(200, bytes.length);
			OutputStream os = httpExchange.getResponseBody();
			os.write( bytes);
			os.flush();
			os.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}