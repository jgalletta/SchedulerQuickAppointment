
public class timeSlots {

 public datetime startTime;
 public datetime endTime;
 public List<String> resources;
 public String territoryId;

 
 public static list<timeSlots> parse(String json) {
     return (list<timeSlots>) System.JSON.deserialize(json, list<timeSlots>.class);
 }
}