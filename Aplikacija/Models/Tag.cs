namespace Models;

[Table("Tagovi")]
public class Tag {
    [Key]
    public int Id { get; set; }
    [Required]
    public string Naziv {get; set; }

    public Tag() {}
    public Tag(int id, string naziv){
        Id = id;
        Naziv = naziv;
    }

    public Tag(string naziv){
        Naziv = naziv;
    }
}