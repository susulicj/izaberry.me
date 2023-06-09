import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Komentar } from 'src/app/models/komentar.model';
import { Student } from 'src/app/models/student.model';
import { UserService } from 'src/app/services/user.service';
import { Privilegije } from 'src/app/models/permission.model';
import { StudentiService } from 'src/app/services/studenti.service';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';


import { AuthService } from 'src/app/services/auth.service';
import { Modul } from 'src/app/models/modul.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  student: Student | null;
  komentari: Komentar[] | null = null;
  editingBio: boolean = false;
  userId: number;
  localId: number;
  showdiv: boolean = false;
  showcontainer: boolean = false;
  rezultat: string = "../../../assets/logoFinal.png";
  searchTerm: string = '';
  searchResults: Student[] = [];
  response!: { dbPath: '' };

  constructor(
    private StudentiService: StudentiService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient // Added http client injection
  ) {
    this.localId = this.authService.currentUserId();
    let userId = this.route.snapshot.paramMap.get("userId");
    if (userId) {
      this.userId = parseInt(userId);
    } else {
      this.userId = this.authService.currentUserId();
    }
    this.student = null;
  }

  async ngOnInit(): Promise<void> {
    try {
      this.student = await this.userService.getUserById(this.userId);
    } catch (err: any) {
      this.router.navigate(["error"], {
        state: err as Error
      });
    }

    this.PostaviSliku();
   
    
  }

  async showPhoto() {
    this.showdiv = true;
  }

  async PostaviSliku() {
    var rez = this.StudentiService.VratiSliku(this.student!.id);
    console.log(rez);
    if(rez != null)
    {
      rez
      .then((odgovor) => {
        this.rezultat = odgovor.replace('Client\\izaberry-client\\src', '..');
        console.log(this.rezultat);
        console.log(odgovor);
      })
      .catch((error) => {
        console.error('Greška prilikom dohvatanja slike:', error);
      });
    }
  
  }

  editBio() {
    this.editingBio = true;
  }

  async saveBio() {
    if (this.student && this.student.bio) {
      this.student.bio = this.student.bio.trim();
      this.editingBio = false;
      try {
        await this.StudentiService.updateStudentBiografija(
          this.student.bio,
          this.student.id
        );
        console.log("Bio saved successfully");
      } catch (error) {
        console.error("Failed to save bio:", error);
      }
    }
  }
  searchUsers(): void {
    if (this.searchTerm.trim() === '') {
      this.searchResults = [];
      return;
    }

  
    this.http.get<any[]>('http://localhost:5006/student/vratiStudente')
      .subscribe(
        (response) => {
         
          const filteredStudents = response.filter((student: any) => {
            return (
              student.username.toLowerCase().startsWith(this.searchTerm.toLowerCase()) ||
              student.email.toLowerCase().startsWith(this.searchTerm.toLowerCase())
            );
          });
        console.log(filteredStudents);
          this.searchResults = filteredStudents.map((student: any) => {
            const modul = student.modul ? new Modul(student.modul.id, student.modul.naziv) : null;
            return new Student(
              student.id,
              student.username,
              modul as Modul, 
              student.semestar,
              student.email,
              student.perm,
              student.bio,
              student.ProfilePhotoURL
            );
          });
        },
        (error) => {
          console.error('Error fetching users:', error);
        }
      );
      console.log(this.searchResults);
  }
  
  

  selectUser(event:Event): void {
    let id=parseInt((event.target as HTMLElement).id);
    console.log(id);
    this.router.navigate(["profile",id]);
  }

  async prikaz() {
    this.showcontainer = false;
    this.showdiv = true;
  }

  async ugasidiv() {
    this.showdiv = false;
  }

  cancelEditBio() {
    this.editingBio = false;
  }

  async show() {
    this.showcontainer = true;
    this.showdiv = false;
  }

  isActiveLink(link: string): boolean {
    return this.router.isActive(link, true);
  }

  logOut() {
    localStorage.removeItem("authToken");
    this.router.navigateByUrl("");
  }

  redirectToOglasna() {
    this.router.navigateByUrl("oglasna");
  }

  redirectToHome() {
    this.router.navigateByUrl("");
  }

  redirectToPredmeti() {
    this.router.navigateByUrl("predmeti");
  }

  redirectToZahtevi() {
    this.router.navigateByUrl("zahtevi");
  }
/* 

  canShowButtons(): boolean {
    if (this.userService.user) {
      return (
        this.userService.user.perm === Privilegije.ADMIN ||
        this.userService.user.perm === Privilegije.MENTOR
      );
    }
    return false;
  }
  */

  uploadFinished = (event: { dbPath: "" }) => {
    this.response = event;
    console.log(this.response);
  };

  async onCreate() {
    this.student!.ProfilePhotoURL = this.response.dbPath;
    console.log(this.student!.ProfilePhotoURL);
    var kodiraj = encodeURIComponent(this.student!.ProfilePhotoURL);
    console.log(kodiraj);
    let updatovano = await this.StudentiService.UpdatePhoto(
      this.student!.id,
      kodiraj
    );

    var rez = this.StudentiService.VratiSliku(this.student!.id);
    rez
      .then((odgovor) => {
        this.rezultat = odgovor.replace('Client\\izaberry-client\\src', '..');
        console.log(this.rezultat);
        console.log(odgovor);
      })
      .catch((error) => {
        console.error('Greška prilikom dohvatanja slike:', error);
      });
  }

  createImgPath() { }
}
