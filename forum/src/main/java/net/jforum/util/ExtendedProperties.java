import java.io.*;
import java.util.*;
 
public class ExtendedProperties {
 
    protected Map<String,String> map;
    private List<String> order;
    protected String enc;
 
    public ExtendedProperties () {
        this("UTF-8"/*"ISO-8859-1"*/);
    }
 
    public ExtendedProperties (String enc) {
        this.enc = enc;
        map = new HashMap<String,String>();
        order = new ArrayList<String>();
    }
 
    private static final String keyValueSeparators = "=: \t\r\n\f";
 
    private static final String strictKeyValueSeparators = "=:";
 
    private static final String specialSaveChars = "=: \t\r\n\f#!";
 
    private static final String whiteSpaceChars = " \t\r\n\f";
 
    public synchronized void load (InputStream inStream) throws IOException {
 
        BufferedReader in = new BufferedReader(new InputStreamReader(inStream, enc));
        while (true) {
            // Get next line
            String line = in.readLine();
            if (line == null)
                return;
 
            if (line.length() > 0) {
                 
                // Find start of key
                int len = line.length();
                int keyStart;
                for (keyStart=0; keyStart<len; keyStart++)
                    if (whiteSpaceChars.indexOf(line.charAt(keyStart)) == -1)
                        break;
 
                // Blank lines are ignored
                if (keyStart == len)
                    continue;
 
                // Continue lines that end in slashes if they are not comments
                char firstChar = line.charAt(keyStart);
                if ((firstChar == '#') || (firstChar == '!')) {
                    // add comment to order list
                    order.add(line.substring(keyStart));
                } else {
                    while (continueLine(line)) {
                        String nextLine = in.readLine();
                        if (nextLine == null)
                            nextLine = "";
                        String loppedLine = line.substring(0, len-1);
                        // Advance beyond whitespace on new line
                        int startIndex;
                        for (startIndex=0; startIndex<nextLine.length(); startIndex++)
                            if (whiteSpaceChars.indexOf(nextLine.charAt(startIndex)) == -1)
                                break;
                        nextLine = nextLine.substring(startIndex,nextLine.length());
                        line = new String(loppedLine+nextLine);
                        len = line.length();
                    }
 
                    // Find separation between key and value
                    int separatorIndex;
                    for (separatorIndex=keyStart; separatorIndex<len; separatorIndex++) {
                        char currentChar = line.charAt(separatorIndex);
                        if (currentChar == '\\')
                            separatorIndex++;
                        else if (keyValueSeparators.indexOf(currentChar) != -1)
                            break;
                    }
 
                    // Skip over whitespace after key if any
                    int valueIndex;
                    for (valueIndex=separatorIndex; valueIndex<len; valueIndex++)
                        if (whiteSpaceChars.indexOf(line.charAt(valueIndex)) == -1)
                            break;
 
                    // Skip over one non whitespace key value separators if any
                    if (valueIndex < len)
                        if (strictKeyValueSeparators.indexOf(line.charAt(valueIndex)) != -1)
                            valueIndex++;
 
                    // Skip over white space after other separators if any
                    while (valueIndex < len) {
                        if (whiteSpaceChars.indexOf(line.charAt(valueIndex)) == -1)
                            break;
                        valueIndex++;
                    }
                    String key = line.substring(keyStart, separatorIndex);
                    String value = (separatorIndex < len) ? line.substring(valueIndex, len) : "";
 
                    // Convert then store key and value
                    key = loadConvert(key);
                    value = loadConvert(value);
                    map.put(key, value);
                    // add key value to order list
                    order.add(key);
                }
            }
        }
    }
 
    /*
     * Returns true if the given line is a line that must be appended to the next line
     */
    private boolean continueLine (String line) {
        int slashCount = 0;
        int index = line.length() - 1;
        while ((index >= 0) && (line.charAt(index--) == '\\'))
            slashCount++;
        return (slashCount % 2 == 1);
    }
 
    /*
     * Converts encoded &#92;uxxxx to unicode chars
     * and changes special saved chars to their original forms
     */
    private String loadConvert (String theString) {
        char aChar;
        int len = theString.length();
        StringBuilder outBuffer = new StringBuilder(len);
 
        for (int x=0; x<len; ) {
            aChar = theString.charAt(x++);
            if (aChar == '\\') {
                aChar = theString.charAt(x++);
                if (aChar == 'u') {
                    // Read the xxxx
                    int value=0;
            for (int i=0; i<4; i++) {
                aChar = theString.charAt(x++);
                switch (aChar) {
                  case '0': case '1': case '2': case '3': case '4':
                  case '5': case '6': case '7': case '8': case '9':
                     value = (value << 4) + aChar - '0';
                 break;
              case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
                 value = (value << 4) + 10 + aChar - 'a';
                 break;
              case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
                 value = (value << 4) + 10 + aChar - 'A';
                 break;
              default:
                  throw new IllegalArgumentException("Malformed \\uxxxx encoding.");
                        }
                    }
                    outBuffer.append((char)value);
                } else {
                    if (aChar == 't') aChar = '\t';
                    else if (aChar == 'r') aChar = '\r';
                    else if (aChar == 'n') aChar = '\n';
                    else if (aChar == 'f') aChar = '\f';
                    outBuffer.append(aChar);
                }
            } else
                outBuffer.append(aChar);
        }
        return outBuffer.toString();
    }
 
    /*
     * writes out any of the characters in specialSaveChars with a preceding slash
     */
    private String saveConvert (String theString, boolean escapeSpace) {
        int len = theString.length();
        StringBuilder outBuffer = new StringBuilder(len*2);
 
        for(int x=0; x<len; x++) {
            char aChar = theString.charAt(x);
            switch(aChar) {
        case ' ':
            if (x == 0 || escapeSpace) 
            outBuffer.append('\\');
 
            outBuffer.append(' ');
            break;
                case '\\':outBuffer.append('\\'); outBuffer.append('\\');
                          break;
                case '\t':outBuffer.append('\\'); outBuffer.append('t');
                          break;
                case '\n':outBuffer.append('\\'); outBuffer.append('n');
                          break;
                case '\r':outBuffer.append('\\'); outBuffer.append('r');
                          break;
                case '\f':outBuffer.append('\\'); outBuffer.append('f');
                          break;
                default:
                    if (specialSaveChars.indexOf(aChar) != -1)
                        outBuffer.append('\\');
                    outBuffer.append(aChar);
            }
        }
        return outBuffer.toString();
    }
 
    public synchronized void save (OutputStream out, String header) throws IOException {
        BufferedWriter awriter;
        awriter = new BufferedWriter(new OutputStreamWriter(out, enc));
        if (header != null)
            writeln(awriter, "#" + header);
        writeln(awriter, "#" + new Date().toString());
 
        Set<String> newKeys = new HashSet<String>(map.keySet());
        for (Iterator<String> iter = order.iterator(); iter.hasNext();) {
            String str = iter.next();
            if ((str.charAt(0) == '#') || (str.charAt(0) == '!')) {
                writeln(awriter, str);
            } else {
                if (newKeys.contains(str)) {
                    String key = saveConvert(str, true);
                    String val = saveConvert(map.get(key), false);
                    writeln(awriter, key + "=" + val);
                    newKeys.remove(str);
                }
            }
        }
        for (Iterator<String> iter = newKeys.iterator(); iter.hasNext();) {
            String key = saveConvert(iter.next(), true);
            String val = saveConvert(map.get(key), false);
            writeln(awriter, key + "=" + val);
        }
 
        awriter.flush();
    }
 
    private static void writeln (BufferedWriter bw, String s) throws IOException {
        bw.write(s);
        bw.newLine();
    }
 
    public String getProperty (String key) {
        return map.get(key);
    }
 
    public String getProperty (String key, String defaultValue) {
        String val = getProperty(key);
        return (val == null) ? defaultValue : val;
    }
 
    public synchronized String setProperty (String key, String value) {
        return map.put(key, value);
    }
 
    public Iterator<String> propertyNames() {
        Map<String,String> h = new HashMap<String,String>();
        for (Iterator<String> i = map.keySet().iterator(); i.hasNext() ;) {
            String key = i.next();
            h.put(key, map.get(key));
        }
        return h.keySet().iterator();
    }
}