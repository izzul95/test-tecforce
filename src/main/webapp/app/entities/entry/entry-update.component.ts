import { Component, OnInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { IEntry, Entry } from 'app/shared/model/entry.model';
import { EntryService } from './entry.service';
import { IBlog } from 'app/shared/model/blog.model';
import { BlogService } from 'app/entities/blog/blog.service';

@Component({
  selector: 'jhi-entry-update',
  templateUrl: './entry-update.component.html'
})
export class EntryUpdateComponent implements OnInit {
  isSaving: boolean;
  isSelectBlogId : boolean;

  isPositiveBlog : boolean;
  isPositiveEmoji : boolean;
  isPositiveTitle : boolean;
  isPositiveContent : boolean;
  isNegativeTitle : boolean;
  isNegativeEmoji : boolean;
  isNegativeContent : boolean;

  blogs: IBlog[];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required]],
    emoji: [null, [Validators.required]],
    content: [null, [Validators.required]],
    blogId: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected jhiAlertService: JhiAlertService,
    protected entryService: EntryService,
    protected blogService: BlogService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.editForm.valueChanges.subscribe( () => {
      this.resetEmojiAndContent()
      this.onChangeFrom()
    });

    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ entry }) => {
      this.updateForm(entry);
    });
    this.blogService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IBlog[]>) => mayBeOk.ok),
        map((response: HttpResponse<IBlog[]>) => response.body)
      )
      .subscribe((res: IBlog[]) => (this.blogs = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  onChangeFrom(){

    var tempBlogId = this.editForm.get(['blogId']).value
    var tempTitle = this.editForm.get(['title']).value
    var tempContent = this.editForm.get(['content']).value

    //checking Blog Id, if null just ignore all emoji and content first
    if(tempBlogId != null && tempBlogId != undefined 
      && tempContent != null && tempContent != undefined
      && tempTitle != null && tempTitle != undefined)
    {
      this.isSelectBlogId = true // means blog already choose
      
      this.isPositiveBlog = false // reset

      for(var i = 0 ; i < this.blogs.length ; i++)
      {
        if(tempBlogId === this.blogs[i].id && this.blogs[i].positive)
        {
          this.isPositiveBlog = true
        }
      }
      
      tempTitle = tempTitle.toUpperCase()
      tempContent = tempContent.toUpperCase()

      // positive blog
      if(this.isPositiveBlog)
      {
        // emoji here
        if(this.editForm.get(['emoji']).value == "LIKE" 
          || this.editForm.get(['emoji']).value == "HAHA" 
          || this.editForm.get(['emoji']).value == "WOW" )
        {
          this.isPositiveEmoji = true
        }

        //content here
        if(tempContent.includes("SAD") || tempContent.includes("FEAR") || tempContent.includes("LONELY") )
        {
          this.isPositiveContent = false
        }

        //title here
        if(tempTitle.includes("SAD") || tempTitle.includes("FEAR") || tempTitle.includes("LONELY") )
        {
          this.isPositiveTitle = false
        }

      }

      else //negative emoji
      {
        // emoji here
        if(this.editForm.get(['emoji']).value == "SAD" 
          || this.editForm.get(['emoji']).value == "ANGRY" 
          || this.editForm.get(['emoji']).value == "WOW" )
        {
          this.isNegativeEmoji = true
        }

        //content here

        if(tempContent.includes("LOVE") || tempContent.includes("HAPPY") || tempContent.includes("TRUST") )
        {
          this.isNegativeContent = false
        }

        //title here

        if(tempTitle.includes("LOVE") || tempTitle.includes("HAPPY") || tempTitle.includes("TRUST") )
        {
          this.isNegativeTitle = false
        }
      }

    }
  }

  resetEmojiAndContent()
  {
    this.isSelectBlogId = false;
    this.isPositiveBlog = false;
    
    this.isPositiveEmoji = false;
    this.isPositiveTitle = true;
    this.isPositiveContent = true;

    this.isNegativeEmoji = false;
    this.isNegativeTitle = true;
    this.isNegativeContent = true;
  }

  updateForm(entry: IEntry) {
    this.editForm.patchValue({
      id: entry.id,
      title: entry.title,
      emoji: entry.emoji,
      content: entry.content,
      blogId: entry.blogId
    });
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  setFileData(event, field: string, isImage) {
    return new Promise((resolve, reject) => {
      if (event && event.target && event.target.files && event.target.files[0]) {
        const file: File = event.target.files[0];
        if (isImage && !file.type.startsWith('image/')) {
          reject(`File was expected to be an image but was found to be ${file.type}`);
        } else {
          const filedContentType: string = field + 'ContentType';
          this.dataUtils.toBase64(file, base64Data => {
            this.editForm.patchValue({
              [field]: base64Data,
              [filedContentType]: file.type
            });
          });
        }
      } else {
        reject(`Base64 data was not set as file could not be extracted from passed parameter: ${event}`);
      }
    }).then(
      // eslint-disable-next-line no-console
      () => console.log('blob added'), // success
      this.onError
    );
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const entry = this.createFromForm();
    if (entry.id !== undefined) {
      this.subscribeToSaveResponse(this.entryService.update(entry));
    } else {
      this.subscribeToSaveResponse(this.entryService.create(entry));
    }
  }

  private createFromForm(): IEntry {
    return {
      ...new Entry(),
      id: this.editForm.get(['id']).value,
      title: this.editForm.get(['title']).value,
      emoji: this.editForm.get(['emoji']).value,
      content: this.editForm.get(['content']).value,
      blogId: this.editForm.get(['blogId']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEntry>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackBlogById(index: number, item: IBlog) {
    return item.id;
  }
}
